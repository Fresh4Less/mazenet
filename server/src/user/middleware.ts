import { Observable } from 'rxjs/Observable';
import * as Express from 'express';

import * as Validator from '../../../common/util/validator';
import FreshSocketIO = require('fresh-socketio-router');
import * as Api from '../../../common/api';
import { Request, Response } from '../common';

import { User, ActiveUser } from './models';
import { Service } from './service';

// temporary imports, won't be needed later
import * as Uuid from 'uuid/v4';

export class Middleware {

    service: Service;
    /** Universal router that can be used in express or fresh-socketio-router */
    router: Express.Router;

    constructor(service: Service) {
        this.router = Express.Router();
        this.router.use((req: Request, res: Response) => {
            //TODO: authenticate based on JWT
            req.user = new User({id: Uuid(), username: 'anon'});
            req.activeUser = new ActiveUser({
                id: Uuid(),
                userId: req.user.id,
                username: 'anon',
                platformData: {pType: 'desktop', cursorPos: {x: 0.5, y: 0.5}}
            });
        });

        let usersRouter = Express.Router();
        usersRouter.post('connect', (req: Request, res: Response) => {
            //TODO: get user from req (middleware)
            let user = new User({id: Uuid(), username: 'test'});
            //TODO: do this with the validator
            let pType: Api.v1.Models.ActiveUser.PlatformDataTypes = req.body && req.body.pType;
            let body: Api.v1.Models.ActiveUser.PlatformData;
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

            this.service.createActiveUser(user, body).subscribe((activeUser: ActiveUser) => {
                return res.status(200).json(activeUser.toV1());
            });

        });

        this.router.use('users', usersRouter);
    }
}


