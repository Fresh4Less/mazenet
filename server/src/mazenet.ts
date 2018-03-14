/**
 * Mazenet app. Controls the REST and socket.io APIs
 */

import * as Express from 'express';
import FreshSocketIO = require('fresh-socketio-router');
import * as SocketIO from 'socket.io';

import { Pool } from 'pg';

import * as CursorRecording from './cursor-recording';
import * as Room from './room';
import * as User from './user';

import { GlobalLogger } from './util/logger';
import { ErrorHandler, RequestLogger } from './util/middleware';

export namespace Mazenet {
    export interface Options {
        postgresPool?: Pool;
    }
}

export class Mazenet {
    public static readonly defaultOptions = {};

    public options: Mazenet.Options;
    public expressApp: Express.Router;
    public socketServer: SocketIO.Server;

    constructor(expressApp: Express.Router, socketServer: SocketIO.Server, options?: Partial<Mazenet.Options>) {
        this.options = Object.assign({}, Mazenet.defaultOptions, options);
        this.expressApp = expressApp;
        this.socketServer = socketServer;
        this.Init();
    }

    protected Init() {
        GlobalLogger.trace('Initializing mazenet');

        const mazenetIo = this.socketServer.of('/mazenet');

        //TODO: will need express middleware to convert GET query params to req.body object
        let cursorDataStore: CursorRecording.DataStore.DataStore;
        let userDataStore: User.DataStore.DataStore;
        let roomDataStore: Room.DataStore.DataStore;
        let activeUserRoomDataStore: Room.DataStore.ActiveUserRoomDataStore;

        if(this.options.postgresPool) {
            cursorDataStore = new CursorRecording.DataStore.InMemoryDataStore();
            userDataStore = new User.DataStore.PostgresDataStore(this.options.postgresPool);
            roomDataStore = new Room.DataStore.PostgresDataStore(this.options.postgresPool);
            activeUserRoomDataStore = new Room.DataStore.InMemoryActiveUserRoomDataStore();
        } else {
            cursorDataStore = new CursorRecording.DataStore.InMemoryDataStore();
            userDataStore = new User.DataStore.InMemoryDataStore();
            roomDataStore = new Room.DataStore.InMemoryDataStore();
            activeUserRoomDataStore = new Room.DataStore.InMemoryActiveUserRoomDataStore();
        }

        const cursorService = new CursorRecording.Service(cursorDataStore);
        const userSessionDataStore = new User.DataStore.SimpleSessionDataStore();
        const userService = new User.Service(userDataStore, userSessionDataStore);
        const roomService = new Room.Service(roomDataStore, activeUserRoomDataStore, userService, cursorService);

        const roomMiddleware = new Room.Middleware(roomService, userService, cursorService, mazenetIo);
        const userMiddleware = new User.Middleware(userService, roomService);

        const router = FreshSocketIO.Router();
        const requestLogger = new RequestLogger();
        router.use(requestLogger.middleware);

        router.use(userMiddleware.router); // must be used first, to authenticate user
        router.use(roomMiddleware.router);

        const errorHandler = new ErrorHandler();
        router.use(errorHandler.middleware);

        this.expressApp.use(router);
        mazenetIo.use(userMiddleware.socketMiddleware);
        mazenetIo.use(roomMiddleware.socketMiddleware);
        mazenetIo.use(FreshSocketIO(router, {
            ignoreList: ['/rooms/active-users/desktop/cursor-moved']
        }));
    }
}
