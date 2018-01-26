/**
 * Mazenet app. Controls the REST and socket.io APIs
 */

import * as Express from 'express';
import * as SocketIO from 'socket.io';
import * as User from './user/user';

export namespace Mazenet {
	export interface Options {
		//app: Express.Router;
		//socketServer: SocketIO.Server;
	}
}

export class Mazenet {
	static readonly defaultOptions = {};

	options: Mazenet.Options;

	constructor(options: Mazenet.Options) {
		this.options = Object.assign({}, Mazenet.defaultOptions, options);
		this.Init();
	}

	protected Init() {
		//TODO: will need express middleware to convert GET query params to req.body object
		let userMiddleware = new User.Middleware({});
		//this.options.socketServer.use((socket: SocketIO.Socket, next) => {
			//socket.on('hello', (data: any) => {
				//console.log('hello!', data);
				////let id: User.Id;
			//});
		//});
	}
}

