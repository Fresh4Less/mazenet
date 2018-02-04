import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';
import * as Express from 'express';

import * as Validator from '../../../common/util/validator';
import FreshSocketIO = require('fresh-socketio-router');
import * as Api from '../../../common/api';
import { Request, Response, Socket, BadRequestError, UnauthorizedError } from '../common';

import { User, ActiveUser } from './models';
import { Room } from '../room/models';
import { Service } from './service';
import { RoomService } from '../room/service';

// temporary imports, won't be needed later
import * as Uuid from 'uuid/v4';

export class Middleware {

    service: Service;
    roomService: RoomService;
    /** Universal router that can be used in express or fresh-socketio-router */
    router: Express.Router;
    socketMiddleware: (socket: Socket, fn: ( err?: any ) => void ) => void;

    constructor(service: Service, roomService: RoomService) {
        this.service = service;
        this.roomService = roomService;

        this.socketMiddleware = (socket: Socket, next: (err?: any) => void) => {
            //TODO: authenticate based on JWT
            socket.mazenet = {
                sessionId: socket.id,
                user: new User({id: Uuid(), username: 'anon'})
            }

            socket.on('disconnect', () => {
                this.service.onUserDisconnect(socket.mazenet!.sessionId);
            });
            next();
        };
        this.router = Express.Router();
        this.router.use((req: Request, res: Response, next: Express.NextFunction) => {
            if((<Socket>req.socket).mazenet) {
                // this is a socketio connection
                //TODO: do we need to validate that activeUser is valid for this user?
                req.user = (<Socket>req.socket).mazenet!.user;
                req.activeUser = this.service.getActiveUserFromSession((<Socket>req.socket).mazenet!.sessionId);
            }
            else {
                //TODO: authenticate based on JWT
                req.user = new User({id: Uuid(), username: 'anon'});
            }
            next();
        });

        let usersRouter = Express.Router();
        usersRouter.post('/connect', (req: Request, res: Response, next: Express.NextFunction) => {
            if(!(<Socket>req.socket).mazenet) {
                throw new BadRequestError('Only websocket sessions can /connect to the Mazenet');
            }
            if(!req.user) {
                throw new UnauthorizedError('User must be logged in');
            }
            //TODO: do this with the validator
            let pType: Api.v1.Models.ActiveUser.PlatformDataTypes = req.body && req.body.pType;
            let body: Api.v1.Models.ActiveUser.PlatformData;
            try {
                switch (pType) {
                    case 'desktop':
                        body = Validator.validateData(req.body, Api.v1.Routes.Users.Connect.Post.Request.Desktop, 'body');
                        break;
                    case 'mobile':
                        body = Validator.validateData(req.body, Api.v1.Routes.Users.Connect.Post.Request.Mobile, 'body');
                        break;
                    default:
                        throw new TypeError(`invalid pType '${pType}'`);
                }
            }
            catch(err: Error) {
                throw new BadRequestError(err.message);
            }

            Observable.forkJoin(
                this.service.createActiveUser((<Socket>req.socket).mazenet!.sessionId, req.user, body),
                this.roomService.getRootRoom())
            .subscribe(([activeUser, rootRoom]: [ActiveUser, Room]) => {
                (<Socket>req.socket).mazenet!.activeUser = activeUser;
                let response: Api.v1.Routes.Users.Connect.Post.Response200 = {
                    activeUser: activeUser.toV1(),
                    rootRoomId: rootRoom.id
                };
                return res.status(200).json(response);
            }, (err: Error) => {
                next(err);
            });
        });

        this.router.use('/users', usersRouter);
    }
}


