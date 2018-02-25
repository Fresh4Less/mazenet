/**
 * Mazenet app. Controls the REST and socket.io APIs
 */

import * as Express from 'express';
import * as SocketIO from 'socket.io';
import FreshSocketIO = require('fresh-socketio-router');

import * as User from './user';
import * as Room from './room';
import * as CursorRecording from './cursor-recording';

import {ErrorHandler, RequestLogger} from './util/middleware';
import {GlobalLogger} from './util/logger';

export namespace Mazenet {
    export interface Options {
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

        let mazenetIo = this.socketServer.of('/mazenet');

        //TODO: will need express middleware to convert GET query params to req.body object
        let cursorDataStore = new CursorRecording.DataStore.InMemoryDataStore();
        let cursorService = new CursorRecording.Service(cursorDataStore);

        let userDataStore = new User.DataStore.InMemoryDataStore();
        let userService = new User.Service(userDataStore);

        let roomDataStore = new Room.DataStore.InMemoryDataStore();
        let roomService = new Room.Service(roomDataStore, cursorService);

        let roomMiddleware = new Room.Middleware(roomService, userService, cursorService, mazenetIo);
        let userMiddleware = new User.Middleware(userService, roomService);

        let router = FreshSocketIO.Router();
        let requestLogger = new RequestLogger();
        router.use(requestLogger.middleware);

        router.use(userMiddleware.router); // must be used first, to authenticate user
        router.use(roomMiddleware.router);

        let errorHandler = new ErrorHandler();
        router.use(errorHandler.middleware);

        this.expressApp.use(router);
        mazenetIo.use(userMiddleware.socketMiddleware);
        mazenetIo.use(roomMiddleware.socketMiddleware);
        mazenetIo.use(FreshSocketIO(router, {
            ignoreList: ['/rooms/active-users/desktop/cursor-moved']
        }));
    }
}

