import * as Express from 'express';
import * as Uuid from 'uuid/v4';

import * as Validator from '../util/validator';
import FreshSocketIO = require('../types/fresh-socketio-router');
import * as Room from '../room/room';
import * as Api from '../api/v1';

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

		let response: Api.Routes.Users.Connect.Post.Response200 = Validator.validateData({userId: 'user', rootRoomId: 'room', fn: () => {}}, Api.Routes.Users.Connect.Post.Response200, 'response');

		//this.router.post('/connect', (req: Request, res: Response) => {
			//res.status(200).json({userId: 'user', rootRoomId: 'room'});
		//});
	}
}
