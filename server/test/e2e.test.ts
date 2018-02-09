import {Observable} from 'rxjs';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/mergeMap';

import * as Http from 'http';
import * as SocketIOClient from 'socket.io-client';

import {Server} from '../src/server';
import {Api} from '../../common/api';
import {GlobalLogger, LoggerHandler} from '../src/util/logger';

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

/** Handle initial /users/connect call */
function connectSocket(client: SocketIOClient): Observable<FreshSocketIOResponse> {
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
        return res;
    });
}

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

        return connectSocket(client).map((res: FreshSocketIOResponse) => {
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

describe('rooms', () => {
    test('POST /enter', () => {
        let client = SocketIOClient(baseUrl);

        return connectSocket(client).mergeMap((res: FreshSocketIOResponse) => {
            let obs = Observable.fromEvent(client, '/rooms/enter');
            client.emit('/rooms/enter', {
                method: 'POST',
                body: {
                    id: res.body.rootRoomId
                }
            });
            return obs;
        }).map((res: FreshSocketIOResponse) => {
            expect(res.status).toBe(200);
            // room
            expect(typeof res.body.room.id).toBe('string');
            expect(typeof res.body.room.creator).toBe('string');
            expect(typeof res.body.room.title).toBe('string');
            expect(typeof res.body.room.stylesheet).toBe('string');

            expect(Array.isArray(res.body.room.owners)).toBe(true);
            expect(res.body.room.owners).toHaveLength(1);

            // structure
            expect(Object.keys(res.body.room.structures)).toHaveLength(1);
            let enterTunnel = res.body.room.structures[Object.keys(res.body.room.structures)[0]];
            expect(typeof enterTunnel.id).toBe('string');
            expect(typeof enterTunnel.creator).toBe('string');
            expect(enterTunnel.pos).toEqual({x: 0.5, y: 0.5});
            expect(enterTunnel.data.sType).toBe('tunnel');
            expect(enterTunnel.data.sourceId).toBe(res.body.room.id);
            expect(typeof enterTunnel.data.targetId).toBe('string');
            expect(typeof enterTunnel.data.sourceText).toBe('string');
            expect(typeof enterTunnel.data.targetId).toBe('string');

            // users
            expect(res.body.users).toBeDefined();
            expect(typeof res.body.users).toBe('object');
            expect(Object.keys(res.body.users)).toHaveLength(0);
        }).first().toPromise();
    });
});
