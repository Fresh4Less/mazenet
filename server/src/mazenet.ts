/**
 * Mazenet app. Controls the REST and socket.io APIs
 */

import * as Express from 'express';
import * as SocketIO from 'socket.io';
import FreshSocketIO = require('fresh-socketio-router');

import * as User from './user';
import * as Room from './room';

import {ErrorHandler} from './util/middleware';
import {GlobalLogger} from './util/logger';

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

    constructor(expressApp: Express.Router, socketServer: SocketIO.Server, options?: Partial<Mazenet.Options>) {
        this.options = Object.assign({}, Mazenet.defaultOptions, options);
        this.expressApp = expressApp;
        this.socketServer = socketServer;
        this.Init();
    }

    protected Init() {
        GlobalLogger.trace('Initializing mazenet');
        //TODO: will need express middleware to convert GET query params to req.body object
        let roomDataStore = new Room.DataStore.InMemoryDataStore();
        let roomService = new Room.Service(roomDataStore);
        let roomMiddleware = new Room.Middleware(roomService);

        let userDataStore = new User.DataStore.InMemoryDataStore();
        let userService = new User.Service(userDataStore);
        let userMiddleware = new User.Middleware(userService);

        let router = FreshSocketIO.Router();
        router.use(userMiddleware.router); // must be used first, to authenticate user
        router.use(roomMiddleware.router);

        let errorHandler = new ErrorHandler();
        router.use(errorHandler.middleware);

        this.expressApp.use(router);
        let mazenetIo = this.socketServer.of('/mazenet');
        mazenetIo.use(FreshSocketIO(router));
    }
}

