import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/operator/mergeMap';

import * as Express from 'express';
import * as SocketIO from 'socket.io';

import FreshSocketIO = require('fresh-socketio-router');
import * as Api from '../../../common/api';
import { validateData } from '../../../common/util/validator';
import { GlobalLogger } from '../util/logger';

import { BadRequestError, ConflictError, mapToObject, Request, Response, Socket, UnauthorizedError } from '../common';
import { ActiveUser, User } from '../user/models';
import { ActiveUserRoomData, EnteredRoomEvent, ExitedRoomEvent, 
    Room, RoomDocument, RoomEvent, Structure, StructureCreatedEvent } from './models';
import { Service } from './service';

import { CursorEvent, CursorMovedEvent, CursorRecording } from '../cursor-recording/models';
import {Service as CursorService } from '../cursor-recording/service';
import {Service as UserService } from '../user/service';

export class Middleware {

    public service: Service;
    public userService: UserService;
    public cursorService: CursorService;
    public socketNamespace: SocketIO.Namespace;
    /** Universal router that can be used in express or fresh-socketio-router */
    public router: Express.Router;
    public socketMiddleware: (socket: Socket, fn: (err?: any) => void) => void;

    constructor(
        service: Service,
        userService: UserService,
        cursorService: CursorService,
        socketNamespace: SocketIO.Namespace
    ) {
        this.service = service;
        this.userService = userService;
        this.cursorService = cursorService;
        this.socketNamespace = socketNamespace;

        // NOTE: consider adding a way to unsubscribe
        service.events.filter((event) => event.event === 'enter').subscribe(
            (event) => this.onEnterRoom(event as EnteredRoomEvent)
        );
        service.events.filter((event) => event.event === 'exit').subscribe(
            (event) => this.onExitRoom(event as ExitedRoomEvent)
        );
        service.events.filter((event) => event.event === 'structure-create').subscribe(
            (event) => this.onCreateStructure(event as StructureCreatedEvent)
        );
        cursorService.events.filter((event) => event.event === 'move').subscribe(
            (event) => this.onCursorMoved(event as CursorMovedEvent)
        );
        this.router = this.makeRouter();
        this.socketMiddleware = this.makeSocketMiddleware();
    }

    public makeSocketMiddleware() {
        return (socket: Socket, next: (err?: any) => void) => {
            socket.on('disconnect', () => {
                if(socket.mazenet!.activeUser) {
                    this.service.exitRoom(socket.mazenet!.activeUser!.id).subscribe(() => {
                        // do nothing
                    }, (error: Error) => {
                        GlobalLogger.error(
                            'ActiveUser failed to exit room on disconnect',
                            {error, activeUser: socket.mazenet!.activeUser}
                        );
                    });
                }
            });

            socket.on('/rooms/active-users/desktop/cursor-moved', (data: any) => {
                let body: Api.v1.Events.Client.Rooms.ActiveUsers.Desktop.CursorMoved;
                try {
                    body = validateData(
                        data,
                        Api.v1.Events.Client.Rooms.ActiveUsers.Desktop.CursorMoved,
                        'body');
                } catch (err) {
                    //TODO: standardize event logging
                    GlobalLogger.request('event-error', {
                        code: 400,
                        message: err.message,
                        route: '/rooms/active-users/desktop/cursor-moved'
                    });
                    return;
                }

                if(!socket.mazenet!.activeUser) {
                    //TODO: standardize event logging
                    GlobalLogger.request('event-error', {
                        code: 409,
                        message: 'Client does not have active user',
                        route: '/rooms/active-users/desktop/cursor-moved'
                    });
                    return;
                }

                return this.service.getActiveUserRoomData(socket.mazenet!.activeUser!.id)
                .mergeMap((activeUserRoomData) => {
                    if(activeUserRoomData) {
                        return this.cursorService.onCursorMoved(activeUserRoomData, body.pos);
                    } else {
                        return Observable.of(null);
                    }
                }).subscribe(() => {
                    //TODO: standardize event logging
                    // unnecessary log
                    //GlobalLogger.request('event-complete', {
                        //code: 200,
                        //route: '/rooms/active-users/desktop/cursor-moved'
                    //});
                }, (err: any) => {
                    //TODO: standardize event logging
                    const errorOut = {
                        code: err.httpCode || 500,
                        data: Object.keys(err).reduce((o: any, p: string) => {
                            o[p] = err[p];
                            return o;
                        }, {}),
                        message: err.message
                    };

                    if(errorOut.code >= 500) {
                        GlobalLogger.error(`Unhandled ${err.constructor.name} in request handler'`, {
                            data: errorOut.data,
                            errorType: err.constructor.name,
                            message: err.message,
                            stack: err.stack
                        });
                    }

                    GlobalLogger.request('event-error', Object.assign(errorOut, {
                        route: '/rooms/active-users/desktop/cursor-moved'
                    }));
                });
            });
            next();
        };

    }

    public makeRouter(): Express.Router {
        const router = Express.Router();

        const roomsRouter = Express.Router();
        roomsRouter.post('/enter', (req: Request, res: Response, next: Express.NextFunction) => {
            if(!(req.socket as Socket).mazenet) {
                throw new BadRequestError('Only websocket sessions can /enter the Mazenet');
            }

            if(!(req.socket as Socket).mazenet!.activeUser) {
                throw new ConflictError('No ActiveUser. You must `POST /users/connect` before you can enter a room');
            }

            let body: Api.v1.Routes.Rooms.Enter.Post.Request;
            try {
                body = validateData(req.body, Api.v1.Routes.Rooms.Enter.Post.Request, 'body');
            } catch (err) {
                throw new BadRequestError(err.message);
            }

            return Observable.forkJoin(
                // get the room and active users
                this.service.getRoomDocument(body.id),
                this.service.getActiveUsersInRoom(body.id)
            ).mergeMap(([roomDocument, activeUsers]) => {
                // enter room
                return Observable.forkJoin(
                    Observable.of(roomDocument),
                    Observable.of(activeUsers),
                    this.service.enterRoom(body.id, (req.socket as Socket).mazenet!.activeUser!));
            }).subscribe(([roomDoc, activeUsers]) => {
                const activeUsersInRoom = mapToObject(activeUsers, (a: ActiveUserRoomData) => a.activeUser.toV1());
                delete activeUsersInRoom[req.activeUser!.id];
                const response: Api.v1.Routes.Rooms.Enter.Post.Response200 = {
                    room: roomDoc.toV1(),
                    users: activeUsersInRoom,
                };
                return res.status(200).json(response);
            }, (err: Error) => {
                return next(err);
            });
        });

        roomsRouter.post('/structures/create', (req: Request, res: Response, next: Express.NextFunction) => {
            if(!req.user) {
                // should this error never occur/be 500? (unauthenticated user is given unique anonymous user data)
                throw new UnauthorizedError('You must be authenticated to create a structure');
            }
            let body: Api.v1.Routes.Rooms.Structures.Create.Post.Request;
            try {
                body = validateData(req.body, Api.v1.Routes.Rooms.Structures.Create.Post.Request, 'body');
            } catch (err) {
                throw new BadRequestError(err.message);
            }
            return this.service.createStructure(req.user, body.roomId, body.structure).subscribe((structure) => {
                return res.status(201).json(structure.toV1());
            }, (err: Error) => {
                return next(err);
            });
        });

        roomsRouter.get('/cursor-recordings', (req: Request, res: Response, next: Express.NextFunction) => {
            let body: Api.v1.Routes.Rooms.CursorRecordings.Get.Request;
            try {
                body = validateData(req.body, Api.v1.Routes.Rooms.CursorRecordings.Get.Request, 'body');
            } catch (err) {
                throw new BadRequestError(err.message);
            }

            return this.cursorService.getCursorRecordings(body.roomId, body.limit || 0)
            .subscribe((cursorRecordings) => {
                const response = {
                    cursorRecordings: mapToObject(cursorRecordings)
                };
                return res.status(200).json(response);
            }, (err: Error) => {
                return next(err);
            });
        });

        router.use('/rooms', roomsRouter);
        return router;
    }

    public onEnterRoom(event: EnteredRoomEvent) {
        const data: Api.v1.Events.Server.Rooms.ActiveUsers.Entered = {
            activeUser: event.activeUser.toV1(),
            roomId: event.roomId
        };
        this.emitToSocketsInRoom(
            event.roomId,
            Api.v1.Events.Server.Rooms.ActiveUsers.Entered.Route,
            data,
            event.activeUser.id
        ).subscribe();
    }

    public onExitRoom(event: ExitedRoomEvent) {
        const data: Api.v1.Events.Server.Rooms.ActiveUsers.Exited = {
            activeUserId: event.activeUser.id,
            roomId: event.roomId
        };
        this.emitToSocketsInRoom(
            event.roomId,
            Api.v1.Events.Server.Rooms.ActiveUsers.Exited.Route,
            data,
            event.activeUser.id
        ).subscribe();
    }

    public onCursorMoved(event: CursorMovedEvent) {
        const data: Api.v1.Events.Server.Rooms.ActiveUsers.Desktop.CursorMoved = {
            activeUserId: event.activeUser.id,
            pos: event.pos,
            roomId: event.roomId
        };
        this.emitToSocketsInRoom(
            event.roomId,
            Api.v1.Events.Server.Rooms.ActiveUsers.Desktop.CursorMoved.Route,
            data,
            event.activeUser.id
        ).subscribe();
    }

    public onCreateStructure(event: StructureCreatedEvent) {
        const data: Api.v1.Events.Server.Rooms.Structures.Created = {
            roomId: event.roomId,
            structure: event.structure.toV1()
        };
        this.emitToSocketsInRoom(
            event.roomId,
            Api.v1.Events.Server.Rooms.Structures.Created.Route,
            data,
            event.user.id,
            true
        ).subscribe();
    }

    private emitToSocketsInRoom(
        roomId: Room.Id,
        route: string,
        data: any,
        ignoreUser: ActiveUser.Id | User.Id,
        ignoreUserNonActive?: boolean
    ) {
        return this.service.getActiveUsersInRoom(roomId).map((activeUsers) => {
            for (const [activeUserId, activeUserRoomData] of activeUsers) {
                if(ignoreUserNonActive) {
                    if(ignoreUser === activeUserRoomData.activeUser.userId) {
                        continue;
                    }
                } else if(activeUserId === ignoreUser) {
                    continue;
                }
                const userSocketId = this.userService.getSessionFromActiveUser(activeUserId);
                if(userSocketId) {
                    this.socketNamespace.to(userSocketId).emit(route, data);
                }
            }
        });
    }
}
