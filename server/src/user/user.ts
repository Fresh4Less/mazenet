import * as Express from 'express';
import * as Uuid from 'uuid/v4';
import {Observable} from 'rxjs/Observable';

import * as Validator from '../util/validator';
import FreshSocketIO = require('../types/fresh-socketio-router');
import * as Room from '../room/room';
import * as Api from '../api';
import {Position} from '../common';

export class User {
	id: User.Id;
	username: string;

	constructor(v1: Api.v1.Models.User) {
		this.id = v1.id;
		this.username = v1.username;
	}
}

export namespace User {
	export type Id = string;
}

export class ActiveUser {
	id: ActiveUser.Id;
	username: string;
	platformData: ActiveUser.PlatformData;

	constructor(v1: Api.v1.Models.ActiveUser) {
		this.id = v1.id;
		this.username = v1.username;
		this.platformData = v1.platformData;
	}

	toV1(): Api.v1.Models.ActiveUser {
		return {
			id: this.id,
			username: this.username,
			platformData: this.platformData,
		};
	}
}

export namespace ActiveUser {
	export type Id = string;

	export type PlatformData = PlatformData.Desktop | PlatformData.Mobile;

	export namespace PlatformData {
		export interface Desktop {
			pType: 'desktop';
			cursorPos: Position
		}
		export interface Mobile {
			pType: 'mobile';
		}
	}
}

export interface Options {
}

type Request = Express.Request | FreshSocketIO.Request;
type Response = Express.Response | FreshSocketIO.Response;

export class Middleware {
	static readonly defaultOptions = {};

	options: Options;
	service: Service;
	/** Universal router that can be used in express or fresh-socketio-router */
	router: Express.Router;

	constructor(service: Service, options?: Partial<Options>) {
		this.options = Object.assign({}, Middleware.defaultOptions, options);
		this.router = Express.Router();

		this.router.post('/connect', (req: Request, res: Response) => {
			//TODO: get user from req (middleware)
			let user = new User({id: Uuid(), username: 'test'});
			//TODO: do this with the validator
			let pType: Api.v1.Models.ActiveUser.PlatformDataTypes = req.body && req.body.pType;
			let body: Api.v1.Models.ActiveUser.PlatformData;
			switch(pType) {
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
	}
}


export interface Service {
	//enterRoom(user Api.Models.

	createUser: (user: Api.v1.Routes.Users.Create.Post.Request) => Observable<User>;
	createActiveUser: (user: User, platformData: Api.v1.Models.ActiveUser.PlatformData) => Observable<ActiveUser>;
}

export class InMemoryService implements Service {
	users: Map<User.Id, User>;
	activeUsers: Map<ActiveUser.Id, ActiveUser>;
	constructor() {
		this.users = new Map<User.Id, User>();
		this.activeUsers = new Map<User.Id, ActiveUser>();
	}

	createUser(userBlueprint: Api.v1.Routes.Users.Create.Post.Request) {
		let user = new User({
			id: Uuid(),
			username: userBlueprint.username
		});

		this.users.set(user.id, user);
		return Observable.create(user);
	}

	createActiveUser(user: Api.v1.Models.User, platformData: Api.v1.Models.ActiveUser.PlatformData) {
		let activeUser = new ActiveUser({
			id: Uuid(),
			username: user.username,
			platformData: platformData
		});

		this.activeUsers.set(activeUser.id, activeUser);
		return Observable.create(activeUser);
	}
}
