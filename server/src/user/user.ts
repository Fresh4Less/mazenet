import * as Express from 'express';
import * as Uuid from 'uuid/v4';

import * as Validator from '../util/validator';
import FreshSocketIO = require('../types/fresh-socketio-router');
import * as Room from '../room/room';


export type Id = string;
export interface User {
	id: Id;
}

export interface ActiveUser {
	userId: Id;
	username: string;
	platformData: PlatformData;
}

export type PlatformData = PlatformData.Desktop | PlatformData.Mobile;

namespace PlatformData {
	export interface Desktop {
		pType: "desktop";
		cursorPos: {
			x: number;
			y: number;
		};
	}
	export interface Mobile {
		pType: "mobile";
	}
}

export namespace Api.v1 {
	export namespace Connect {
		export namespace Post {
			export class Request {
			}
			export class Response {
				@Validator.validate()
				userId: Id;
				@Validator.validate()
				rootRoomId: Room.Id;
				@Validator.validate()
				fn: () => void;
			}
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
	/** Universal router that can be used in express or fresh-socketio-router */
	router: Express.Router;

	constructor(options: Partial<Options>) {
		this.options = Object.assign({}, Middleware.defaultOptions, options);
		this.router = Express.Router();

		let response: Api.v1.Connect.Post.Response = Validator.validateData({userId: 'user', rootRoomId: 'room', fn: () => {}}, Api.v1.Connect.Post.Response, 'response');

		this.router.post('/connect', (req: Request, res: Response) => {
			//TODO: use validation
			//res.status(200).json({userId: 'user', rootRoomId: 'room'});
		});
	}
}
