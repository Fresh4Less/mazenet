import * as Express from 'express';

import FreshSocketIO = require('../types/fresh-socketio-router');
import * as Validator from '../util/validator';
import * as Api from '../api';

import {Service} from './service';
import {Structure} from './models';
import {User} from '../user/models';

// temporary imports, won't be needed later
import * as Uuid from 'uuid/v4';

type Request = Express.Request | FreshSocketIO.Request;
type Response = Express.Response | FreshSocketIO.Response;

export class Middleware {

	service: Service;
	/** Universal router that can be used in express or fresh-socketio-router */
	router: Express.Router;

	constructor(service: Service) {
		this.service = service;
		this.router = this.makeRouter(service);
	}

	makeRouter(service: Service): Express.Router {
		let router = Express.Router();
		router.post('enter', (req: Request, res: Response) => {
			//TODO: get the ActiveUser from the authenticated user in req
			let body: Api.v1.Routes.Rooms.Enter.Post.Request = Validator.validateData(req.body, Api.v1.Routes.Rooms.Enter.Post.Request, 'body');
			//this.service.enterRoom(body.id);
			//return res.status(200).json({userId: 'user', rootRoomId: 'room'});
		});

		router.post('strutures/create', (req: Request, res: Response) => {
			let body: Api.v1.Routes.Rooms.Structures.Create.Post.Request = Validator.validateData(req.body, Api.v1.Routes.Rooms.Structures.Create.Post.Request, 'body');
			//TODO: get user from req (middleware)
			let user = new User({id: Uuid(), username: 'test'});
			service.createStructure(user, body.roomId, body.structure).subscribe((structure: Structure) => {
				return res.status(201).json(structure.toV1());
			});
		});

		return router;
	}
}

