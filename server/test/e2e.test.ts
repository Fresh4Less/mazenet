import {Server} from '../src/server.ts';

import * as Http from 'http';
import * as SocketIOClient from 'socket.io-client';

let server: Server;

beforeEach(() => {
    server = new Server({
        port: 0,
        securePort: 0,
        //sslCertPath: '',
        env: 'test'
    });
    server.start();
    //TODO: make this async, get server.httpServer.address()
});

describe('/users', () => {
    test('POST /connect', () => {
        //let client = SocketIOClient(
    });
});
