/**
 * Mazenet app. Controls the REST and socket.io APIs
 */

import * as Express from 'express';
import * as SocketIO from 'socket.io';
import * as User from './user';
import * as Room from './room';

export namespace Mazenet {
	export interface Options {
		//app: Express.Router;
		//socketServer: SocketIO.Server;
	}
}

export class Mazenet {
	static readonly defaultOptions = {};

	options: Mazenet.Options;
	expressApp: Express.Router;
	socketServer: SocketIO.Server;

	constructor(expressApp: Express.Router, /*socketServer: SocketIO.Server,*/ options?: Partial<Mazenet.Options>) {
		this.options = Object.assign({}, Mazenet.defaultOptions, options);
		this.expressApp = expressApp;
		//this.socketServer = socketServer;
		this.Init();
	}

	protected Init() {
		//TODO: will need express middleware to convert GET query params to req.body object
		let roomDataStore = new Room.DataStore.InMemoryDataStore();
		let roomService = new Room.Service(roomDataStore);
		let roomMiddleware = new Room.Middleware(roomService);

		let userDataStore = new User.DataStore.InMemoryDataStore();
		let userService = new User.Service(userDataStore);
		let userMiddleware = new User.Middleware(userService);

		this.expressApp.use('rooms', roomMiddleware.router);
		this.expressApp.use('users', userMiddleware.router);

		//let mazenetIo = this.socketServer.of('/mazenet');
		//this.socketServer.use((socket: SocketIO.Socket, next) => {
		//});
		//this.options.socketServer.use((socket: SocketIO.Socket, next) => {
			//socket.on('hello', (data: any) => {
				//console.log('hello!', data);
				////let id: User.Id;
			//});
		//});
	}
}

