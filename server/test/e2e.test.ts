import {Observable} from 'rxjs';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/mergeMap';

import {Server} from '../src/server';
import {GlobalLogger, LoggerHandler} from '../src/util/logger';

import * as Http from 'http';
import * as SocketIOClient from 'socket.io-client';

interface FreshSocketIOResponse {
    status: number;
    headers: {[name: string]: string};
    body: any;
}

let server: Server;
let baseUrl: string;

// disable all non-error console output
GlobalLogger.handlers.forEach((handler: LoggerHandler, level: string) => {
    if(level !== 'error') {
        handler.enabled = false;
    }
});

beforeEach(() => {
    server = new Server({
        port: 0,
        securePort: 0,
        //sslCertPath: '',
        env: 'test'
    });
    return server.start().map(() => {
        let protocol = server.usingSsl ? 'https' : 'http';
        baseUrl = `${protocol}://127.0.0.1:${server.httpServer.address().port}/mazenet`;
    }).toPromise();
});

describe('users', () => {
    test('POST /connect', () => {
        let client = SocketIOClient(baseUrl);

        return Observable.fromEvent(client, 'connect').mergeMap(() => {
            let obs = Observable.fromEvent(client, '/users/connect');
            client.emit('/users/connect', {
                method: 'POST',
                body: {
                    pType: 'desktop',
                    cursorPos: {
                        x: 0.5,
                        y: 0.5,
                    }
                }
            });
            return obs;
        }).map((res: FreshSocketIOResponse) => {
            expect(res.status).toBe(200);
            expect(typeof res.body.rootRoomId).toBe('string');
            expect(typeof res.body.activeUser.id).toBe('string');
            expect(typeof res.body.activeUser.userId).toBe('string');
            expect(typeof res.body.activeUser.username).toBe('string');
            expect(res.body.activeUser.platformData).toEqual({
                pType: 'desktop',
                cursorPos: {
                    x: 0.5,
                    y: 0.5,
                }
            });
        }).first().toPromise();
    });
});
