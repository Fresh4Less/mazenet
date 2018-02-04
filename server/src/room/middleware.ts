import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/operator/mergeMap';
import * as Express from 'express';

import FreshSocketIO = require('fresh-socketio-router');
import * as Validator from '../../../common/util/validator';
import * as Api from '../../../common/api';
import {GlobalLogger} from '../util/logger';

import { Request, Response, Socket, ConflictError } from '../common';
import { Service } from './service';
import { Room, Structure } from './models';
import { User, ActiveUser } from '../user/models';

// temporary imports, won't be needed later
import * as Uuid from 'uuid/v4';

export class Middleware {

    service: Service;
    /** Universal router that can be used in express or fresh-socketio-router */
    router: Express.Router;
    socketMiddleware: (socket: Socket, fn: (err?: any) => void) => void;

    constructor(service: Service) {
        this.service = service;
        this.router = this.makeRouter(service);
        this.socketMiddleware = (socket: Socket, next: (err?: any) => void) => {
            socket.on('disconnect', () => {
                if(socket.mazenet!.activeUser) {
                    this.service.exitRoom(socket.mazenet!.activeUser!).subscribe(() => {}, (err: Error) => {
                        GlobalLogger.error('ActiveUser failed to exit room on disconnect', {activeUser: socket.mazenet!.activeUser});
                    });
                }
            });
            next();
        };
    }

    makeRouter(service: Service): Express.Router {
        let router = Express.Router();

        let roomsRouter = Express.Router();
        roomsRouter.post('/enter', (req: Request, res: Response, next: Express.NextFunction) => {
            if(!req.activeUser) {
                throw new ConflictError('No ActiveUser. You must `POST /users/connect` before you can enter a room');
            }

            let body: Api.v1.Routes.Rooms.Enter.Post.Request = Validator.validateData(req.body, Api.v1.Routes.Rooms.Enter.Post.Request, 'body');

            return Observable.forkJoin(this.service.getRoom(body.id), this.service.getActiveUsersInRoom(body.id))
            .mergeMap(([room, activeUsers]: [Room, Map<ActiveUser.Id, ActiveUser>]) => {
                // enter room after getting the room and active users
                return Observable.forkJoin(Observable.of(room), Observable.of(activeUsers), this.service.enterRoom(body.id, req.activeUser!));
            }).subscribe(([room, activeUsers]: [Room, Map<ActiveUser.Id, ActiveUser>, null]) => {
                // construct response
                let activeUsersObj: {[activeUserId: string]: Api.v1.Models.ActiveUser} = {};
                for(let [id, activeUser] of activeUsers) {
                    activeUsersObj[id] = activeUser.toV1();
                }
                let response: Api.v1.Routes.Rooms.Enter.Post.Response200 = {
                    room: room,
                    users: activeUsersObj
                };
                return res.status(200).json(response);
            }, (err: Error) => {
                return next(err);
            });
        });

        roomsRouter.post('/strutures/create', (req: Request, res: Response, next: Express.NextFunction) => {
            let body: Api.v1.Routes.Rooms.Structures.Create.Post.Request = Validator.validateData(req.body, Api.v1.Routes.Rooms.Structures.Create.Post.Request, 'body');
            //TODO: get user from req (middleware)
            let user = new User({id: Uuid(), username: 'test'});
            return service.createStructure(user, body.roomId, body.structure).subscribe((structure: Structure) => {
                return res.status(201).json(structure.toV1());
            }, (err: Error) => {
                return next(err);
            });
        });


        router.use('/rooms', roomsRouter);
        return router;
    }
}

