/**
 * Mazenet app. Controls the REST and socket.io APIs
 */

import * as Express from 'express';
import * as SocketIO from 'socket.io';
import * as User from './user/user';
import * as Room from './room/room';

export namespace Mazenet {
	export interface Options {
		//app: Express.Router;
		//socketServer: SocketIO.Server;
	}
}

export class Mazenet {
	static readonly defaultOptions = {};

	options: Mazenet.Options;

	constructor(options?: Partial<Mazenet.Options>) {
		this.options = Object.assign({}, Mazenet.defaultOptions, options);
		this.Init();
	}

	protected Init() {
		//TODO: will need express middleware to convert GET query params to req.body object
		let roomService = new Room.InMemoryService();
		let roomMiddleware = new Room.Middleware(roomService);
		let userService = new User.InMemoryService();
		let userMiddleware = new User.Middleware(userService);
		//this.options.socketServer.use((socket: SocketIO.Socket, next) => {
			//socket.on('hello', (data: any) => {
				//console.log('hello!', data);
				////let id: User.Id;
			//});
		//});
	}
}

