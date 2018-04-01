import { QueryResult } from 'pg';
import { Observable } from 'rxjs';

import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/observable/timer';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/toPromise';

import * as Http from 'http';
import * as SocketIOClient from 'socket.io-client';

import * as Api from '../../common/api';
import { Server } from '../src/server';
import { GlobalLogger, LoggerHandler } from '../src/util/logger';

//interface Emit {
    //eventName: string;
    //data: any;
//}

interface Request {
    route: string;
    method: string;
    headers?: {[name: string]: string};
    body: any;
}

interface Response {
    status: number;
    headers: {[name: string]: string};
    body: any;
}

/** Connects a SocketIO client and records request/response for each transaction. Provides helper functions for issuing and validating transactions
 * user and activeUser properties are automatically set after using connectSocket() or connectAndEnter()
 */
class Client {
    public client: SocketIOClient.Socket;
    /** transaction history */
    public transactions: Array<[Request, Response]>;
    /** last request */
    public req: Request;
    /** last response */
    public res: Response;
    //user?: Api.v1.Models.User;
    public activeUser?: Api.v1.Models.ActiveUser;

    /** events registered with listenEvent are recorded here. key: event name, value: event data in the order it was received */
    public receivedEvents: Map<string, any[]>;
    /** after emitting an event, record heard events */
    //emitHistory: [Emit, Emit[]][];
    /** last event emitted */
    //lastEmitted: [Emit, Emit[]];

    constructor(url: string) {
        this.client = SocketIOClient(url);
        this.transactions = [];
        this.receivedEvents = new Map<string, any[]>();
        //this.emitHistory = [];
    }

    public emitTransaction(method: string, route: string, body: any): Observable<Client> {
        const request: Request = {route, method, body};
        const obs: Observable<Response> = Observable.fromEvent(this.client, route);
        this.client.emit(route, {
            body,
            method,
        });
        return Observable.forkJoin(Observable.of(request), obs.first())
        .map(([req, res]: [Request, Response]) => {
            this.transactions.push([req, res]);
            this.req = req;
            this.res = res;
            return this;
        });
    }

    public listenEvent(eventName: string) {
        const events: any[] = [];
        this.receivedEvents.set(eventName, events);
        this.client.on(eventName, (data: any) => {
            events.push(data);
        });
    }

    //emit(emitEvent: string, body: any, listenEvent: string): Observable<Client> {
        //let obs: Observable<Response> = Observable.fromEvent(this.client, listenEvent);
        //this.client.emit(emitEvent, body);
        //let eventRecord: Emit[] = [
            //{eventName: emitEvent, data: body},
            //[]
        //];

        //this.emitHistory.push(eventRecord);
        //return obs.map((res) => {
            //// mutate the eventRecord in emitHistory
            //eventRecord[1].push({eventName: listenEvent, data: res});
            //this.lastEmitted = eventRecord;
            //return this;
        //});
    //}

    /** Handle initial /users/connect call */
    public connectSocket(): Observable<Client> {
        return this.emitTransaction('POST', Api.v1.Routes.Users.Connect.Route,
            {
                cursorPos: {
                    x: 0.5,
                    y: 0.5,
                },
                pType: 'desktop',
            }
        ).map((client) => {
            expect(client.res.status).toBe(200);
            expect(typeof client.res.body.activeUser).toBe('object');
            this.activeUser = client.res.body.activeUser;
            return client;
        });
    }

    /** Handle initial /users/connect then /rooms/enter the root room */
    public connectAndEnter(): Observable<Client> {
        return this.connectSocket().mergeMap((client) => {
            return this.emitTransaction('POST', Api.v1.Routes.Rooms.Enter.Route, {id: client.res.body.rootRoomId});
        }).map((client) => {
            expect(client.res.status).toBe(200);
            return client;
        });
    }
}

let server: Server;
let baseUrl: string;

// disable all non-error console output
GlobalLogger.handlers.forEach((handler: LoggerHandler, level: string) => {
    if(level !== 'error' && level !== 'warn') {
        handler.enabled = false;
    }
});

// uncomment for debugging
//GlobalLogger.handlers.get('request')!.enabled = true;
//GlobalLogger.handlers.get('trace')!.enabled = true;

const postgres = (global as any).postgres;

beforeEach(() => {
    server = new Server({
        env: 'test',
        port: 0,
        postgres,
        securePort: 0,
    });
    return server.start().map(() => {
        const protocol = server.usingSsl ? 'https' : 'http';
        baseUrl = `${protocol}://127.0.0.1:${server.httpServer.address().port}/mazenet`;
        if(postgres) {
            // delete from all tables
            return server.postgresPool!.query(
                `SELECT table_name FROM information_schema.tables WHERE table_schema='mazenet'`
            ).then((result: QueryResult) => {
                return Observable.forkJoin(
                    result.rows.map((row) => Observable.fromPromise(server.postgresPool!.query(`TRUNCATE ${row.table_name} CASCADE`)))
                ).toPromise();
            });
        }
    }).toPromise();
});

describe('users', () => {
    test('POST /connect', () => {
        const client = new Client(baseUrl);

        return client.connectSocket().map(() => {
            const res = client.res;
            expect(res.status).toBe(200);
            expect(typeof res.body.rootRoomId).toBe('string');
            expect(typeof res.body.activeUser.id).toBe('string');
            expect(typeof res.body.activeUser.userId).toBe('string');
            expect(typeof res.body.activeUser.username).toBe('string');
            expect(res.body.activeUser.platformData).toEqual({
                cursorPos: {
                    x: 0.5,
                    y: 0.5,
                },
                pType: 'desktop',
            });
        }).first().toPromise();
    });
});

describe('single client', () => {
    describe('rooms', () => {
        test('POST /enter', () => {
            const client = new Client(baseUrl);

            return client.connectAndEnter().map(() => {
                const res = client.res;
                expect(res.status).toBe(200);
                // room
                expect(typeof res.body.room.id).toBe('string');
                expect(typeof res.body.room.creator).toBe('string');
                expect(typeof res.body.room.title).toBe('string');
                expect(typeof res.body.room.stylesheet).toBe('string');

                expect(Array.isArray(res.body.room.owners)).toBe(true);
                expect(res.body.room.owners).toHaveLength(1);

                // structure. only validate the enter structure
                expect(Object.keys(res.body.room.structures).length).toBeGreaterThanOrEqual(1);
                const enterTunnelId = Object.keys(res.body.room.structures).filter((structureId) => {
                    const structure = res.body.room.structures[structureId];
                    return structure.data.sType === 'tunnel' && structure.data.sourceText === 'enter';
                })[0];
                const enterTunnel = res.body.room.structures[enterTunnelId];
                expect(typeof enterTunnel.id).toBe('string');
                expect(typeof enterTunnel.creator).toBe('string');
                expect(typeof enterTunnel.pos.x).toBe('number');
                expect(typeof enterTunnel.pos.y).toBe('number');
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

        test('POST /update', () => {
            const client = new Client(baseUrl);
            return client.connectAndEnter().mergeMap(() => {
                const body = client.res.body as Api.v1.Routes.Rooms.Enter.Post.Response200;
                return client.emitTransaction('POST', Api.v1.Routes.Rooms.Update.Route, {
                    id: body.room.id,
                    patch: {
                        owners: [client.activeUser!.userId], // hehe >:)
                        stylesheet: '/*test*/',
                        title: 'my zone',
                    },
                });
            }).map(() => {
                expect(client.res.status).toBe(200);

                const oldRoom: Api.v1.Models.Room = client.transactions[1][1].body.room;
                const body = client.res.body as Api.v1.Routes.Rooms.Update.Post.Response200;
                expect(body.id).toBe(oldRoom.id);
                expect(body.creator).toBe(oldRoom.creator);
                expect(body.structures).toEqual(oldRoom.structures);

                expect(body.owners).toEqual([client.activeUser!.userId]);
                expect(body.stylesheet).toEqual('/*test*/');
                expect(body.title).toEqual('my zone');
            }).first().toPromise();
    });

        describe('structures', () => {
            describe('tunnel', () => {
                test('POST /create', () => {
                    const client = new Client(baseUrl);
                    return client.connectAndEnter().mergeMap(() => {
                        const res = client.res;
                        return client.emitTransaction('POST', Api.v1.Routes.Rooms.Structures.Create.Route, {
                            roomId: res.body.room.id,
                            structure: {
                                data: {
                                    sType: 'tunnel',
                                    sourceText: 'the hills',
                                    targetText: 'mazenet'
                                },
                                pos: {x: 0.1, y: 0.1},
                            }
                        });
                    }).mergeMap(() => {
                        const res = client.res;
                        expect(res.status).toBe(201);
                        expect(typeof res.body.id).toBe('string');
                        expect(res.body.creator).toBe(client.activeUser!.userId);
                        expect(res.body.pos).toEqual({x: 0.1, y: 0.1});
                        expect(res.body.data.sType).toBe('tunnel');
                        expect(res.body.data.sourceId).toBe(client.req.body.roomId);
                        expect(typeof res.body.data.targetId).toBe('string');
                        expect(res.body.data.sourceText).toBe('the hills');
                        expect(res.body.data.targetText).toBe('mazenet');

                        // ensure the target room can be entered
                        return client.emitTransaction('POST', Api.v1.Routes.Rooms.Enter.Route, {id: res.body.data.targetId});
                    }).map(() => {
                        const res = client.res;
                        expect(res.status).toBe(200);

                        // room
                        expect(res.body.room.creator).toBe(client.activeUser!.userId);
                        expect(res.body.room.title).toBe('the hills');

                        expect(Array.isArray(res.body.room.owners)).toBe(true);
                        expect(res.body.room.owners).toHaveLength(1);
                        expect(res.body.room.owners).toContain(client.activeUser!.userId);

                        // structure
                        expect(Object.keys(res.body.room.structures)).toHaveLength(1);
                        const tunnel = res.body.room.structures[Object.keys(res.body.room.structures)[0]];
                        expect(tunnel.id).toBe(client.transactions[2][1].body.id);
                    }).first().toPromise();
                });

                test('POST /update', () => {
                    const client = new Client(baseUrl);
                    return client.connectAndEnter().mergeMap(() => {
                        // create the structure
                        const res = client.res;
                        return client.emitTransaction('POST', Api.v1.Routes.Rooms.Structures.Create.Route, {
                            roomId: res.body.room.id,
                            structure: {
                                data: {
                                    sType: 'tunnel',
                                    sourceText: 'the hills',
                                    targetText: 'mazenet'
                                },
                                pos: {x: 0.1, y: 0.1},
                            }
                        });
                    }).mergeMap(() => {
                        const res = client.res;
                        expect(typeof res.body.id).toBe('string');
                        return client.emitTransaction('POST', Api.v1.Routes.Rooms.Structures.Update.Route, {
                            id: res.body.id,
                            patch: {
                                data: {
                                    sourceText: 'the caves'
                                },
                                pos: {x: 0.8, y: 0.8},
                            }
                        });
                    }).map(() => {
                        const res = client.res;
                        const oldStructure = client.transactions[2][1].body;
                        expect(res.status).toBe(200);
                        expect(res.body.id).toBe(oldStructure.id);
                        expect(res.body.creator).toBe(oldStructure.creator);
                        expect(res.body.data.sType).toBe(oldStructure.data.sType);
                        expect(res.body.data.sourceId).toBe(oldStructure.data.sourceId);
                        expect(res.body.data.targetId).toBe(oldStructure.data.targetId);
                        expect(res.body.data.targetText).toBe(oldStructure.data.targetText);

                        expect(res.body.data.sourceText).toBe('the caves');
                        expect(res.body.pos).toEqual({x: 0.8, y: 0.8});
                    }).first().toPromise();
                });
            });
        });

        describe('cursors', () => {
            test('cursor recording on disconnect', () => {
                const client = new Client(baseUrl);
                const client2 = new Client(baseUrl);
                return client.connectAndEnter().map(() => {
                    client.client.emit(
                        Api.v1.Events.Client.Rooms.ActiveUsers.Desktop.CursorMoved.Route,
                        {pos: {x: 0.1, y: 0.1}});
                }).delay(30).map(() => {
                    client.client.emit(
                        Api.v1.Events.Client.Rooms.ActiveUsers.Desktop.CursorMoved.Route,
                        {pos: {x: 0.2, y: 0.2}});
                }).delay(30).map(() => {
                    client.client.close();
                }).delay(30).mergeMap(() => {
                    return client2.connectAndEnter();
                }).mergeMap(() => {
                    const res = client2.res;
                    return client2.emitTransaction('GET', Api.v1.Routes.Rooms.CursorRecordings.Route, {
                        roomId: res.body.room.id
                    });
                }).map(() => {
                    const res = client2.res;
                    expect(res.status).toBe(200);
                    expect(Object.keys(res.body.cursorRecordings)).toHaveLength(1);

                    const recording = res.body.cursorRecordings[Object.keys(res.body.cursorRecordings)[0]];
                    expect(typeof recording.id).toBe('string');
                    expect(recording.activeUserId).toBe(client.activeUser!.id);

                    expect(Array.isArray(recording.frames)).toBe(true);
                    expect(recording.frames).toHaveLength(2);

                    expect(recording.frames[0].pos).toEqual({x: 0.1, y: 0.1});
                    expect(typeof recording.frames[0].t).toBe('number');
                    expect(recording.frames[1].pos).toEqual({x: 0.2, y: 0.2});
                    expect(typeof recording.frames[1].t).toBe('number');
                    expect(recording.frames[1].t).toBeGreaterThan(recording.frames[0].t);
                }).first().toPromise();
            });
        });
    });
});

/** multi client tests validate that a second client recieves the correct socket events */
describe('multi-client', () => {
    describe('rooms', () => {
        test('POST /enter', () => {
            const client = new Client(baseUrl);
            const client2 = new Client(baseUrl);

            return client.connectAndEnter().mergeMap(() => {
                client.listenEvent(Api.v1.Events.Server.Rooms.ActiveUsers.Entered.Route);
                return client2.connectAndEnter();
            }).map(() => {
                const res = client2.res;

                expect(typeof res.body.users).toBe('object');
                const roomUserIds = Object.keys(res.body.users);
                expect(roomUserIds.length).toBe(1);
                const activeUserInRoom = res.body.users[roomUserIds[0]];
                expect(activeUserInRoom).toEqual(client.activeUser);

                const enterEvents = client.receivedEvents.get(Api.v1.Events.Server.Rooms.ActiveUsers.Entered.Route);
                expect(enterEvents).toBeDefined();
                expect(enterEvents!.length).toBe(1);

                const enterEvent: Api.v1.Events.Server.Rooms.ActiveUsers.Entered = enterEvents![0];
                expect(typeof enterEvent.activeUser).toBe('object');
                expect(enterEvent.activeUser).toEqual(client2.activeUser);
                expect(typeof enterEvent.roomId).toBe('string');
                expect(enterEvent.roomId).toBe(res.body.room.id);
            }).first().toPromise();
        });

        test('POST /update', () => {
            const client = new Client(baseUrl);
            const client2 = new Client(baseUrl);

            return client.connectAndEnter().mergeMap(() => {
                return client2.connectAndEnter();
            }).mergeMap(() => {
                client.listenEvent(Api.v1.Events.Server.Rooms.Updated.Route);
                const body = client2.res.body as Api.v1.Routes.Rooms.Enter.Post.Response200;
                return client2.emitTransaction('POST', Api.v1.Routes.Rooms.Update.Route, {
                    id: body.room.id,
                    patch: {
                        owners: [client2.activeUser!.userId], // hehe >:)
                        stylesheet: '/*test*/',
                        title: 'my zone',
                    },
                });
            }).delay(30).map(() => {
                expect(client2.res.status).toBe(200);

                const events = client.receivedEvents.get(Api.v1.Events.Server.Rooms.Updated.Route);
                expect(events).toBeDefined();
                expect(events!.length).toBe(1);

                const event: Api.v1.Events.Server.Rooms.Updated = events![0];

                const oldRoom: Api.v1.Models.Room = client.transactions[1][1].body.room;

                expect(event.id).toBe(oldRoom.id);
                expect(event.creator).toBe(oldRoom.creator);
                expect(event.structures).toEqual(oldRoom.structures);

                expect(event.owners).toEqual([client2.activeUser!.userId]);
                expect(event.stylesheet).toEqual('/*test*/');
                expect(event.title).toEqual('my zone');

            }).first().toPromise();
        });

        describe('structures', () => {
            describe('tunnel', () => {
                test('POST /create', () => {
                    const client = new Client(baseUrl);
                    const client2 = new Client(baseUrl);

                    return client.connectAndEnter().mergeMap(() => {
                        return client2.connectAndEnter();
                    }).mergeMap(() => {
                        client.listenEvent(Api.v1.Events.Server.Rooms.Structures.Created.Route);
                        const res = client2.res;
                        return client2.emitTransaction('POST', Api.v1.Routes.Rooms.Structures.Create.Route, {
                            roomId: res.body.room.id,
                            structure: {
                                data: {
                                    sType: 'tunnel',
                                    sourceText: 'the hills',
                                    targetText: 'mazenet'
                                },
                                pos: {x: 0.1, y: 0.1},
                            }
                        });
                    }).map(() => {
                        const res = client2.res;
                        const events = client.receivedEvents.get(Api.v1.Events.Server.Rooms.Structures.Created.Route);
                        expect(events).toBeDefined();
                        expect(events!.length).toBe(1);

                        const event: Api.v1.Events.Server.Rooms.Structures.Created = events![0];
                        expect(typeof event.roomId).toBe('string');
                        expect(event.roomId).toBe(client2.transactions[1][1].body.room.id);
                        expect(typeof event.structure).toBe('object');
                        expect(event.structure).toEqual(res.body);
                    }).first().toPromise();
                });

                test('POST /update', () => {
                    const client = new Client(baseUrl);
                    const client2 = new Client(baseUrl);
                    return client.connectAndEnter().mergeMap(() => {
                        return client2.connectAndEnter();
                    }).mergeMap(() => {
                        // create the structure
                        const res = client2.res;
                        return client2.emitTransaction('POST', Api.v1.Routes.Rooms.Structures.Create.Route, {
                            roomId: res.body.room.id,
                            structure: {
                                data: {
                                    sType: 'tunnel',
                                    sourceText: 'the hills',
                                    targetText: 'mazenet'
                                },
                                pos: {x: 0.1, y: 0.1},
                            }
                        });
                    }).mergeMap(() => {
                        const res = client2.res;
                        expect(res.status).toBe(201);
                        expect(typeof res.body.id).toBe('string');

                        client.listenEvent(Api.v1.Events.Server.Rooms.Structures.Updated.Route);
                        return client2.emitTransaction('POST', Api.v1.Routes.Rooms.Structures.Update.Route, {
                            id: res.body.id,
                            patch: {
                                data: {
                                    sourceText: 'the caves'
                                },
                                pos: {x: 0.8, y: 0.8},
                            }
                        });
                    }).delay(30).map(() => {
                        expect(client2.res.status).toBe(200);
                        const events = client.receivedEvents.get(Api.v1.Events.Server.Rooms.Structures.Updated.Route);
                        expect(events).toBeDefined();
                        expect(events!.length).toBe(1);

                        const event: Api.v1.Events.Server.Rooms.Structures.Updated = events![0];
                        expect(event.roomId).toBe(client.transactions[1][1].body.room.id);

                        const oldStructure = client2.transactions[2][1].body;
                        expect(event.structure.id).toBe(oldStructure.id);
                        expect(event.structure.creator).toBe(oldStructure.creator);
                        expect(event.structure.data.sType).toBe(oldStructure.data.sType);
                        const structureData = event.structure.data as Api.v1.Models.StructureData.Tunnel;
                        expect(structureData.sourceId).toBe(oldStructure.data.sourceId);
                        expect(structureData.targetId).toBe(oldStructure.data.targetId);
                        expect(structureData.targetText).toBe(oldStructure.data.targetText);

                        expect(event.structure.pos).toEqual({x: 0.8, y: 0.8});
                        expect(structureData.sourceText).toBe('the caves');
                    }).first().toPromise();
                });
            });
        });
        test('cursor movement', () => {
            const client = new Client(baseUrl);
            const client2 = new Client(baseUrl);
            const clientRoute = Api.v1.Events.Client.Rooms.ActiveUsers.Desktop.CursorMoved.Route;
            const serverRoute = Api.v1.Events.Server.Rooms.ActiveUsers.Desktop.CursorMoved.Route;
            const cursorPositions = [
                {x: 0.1, y: 0.1},
                {x: 0.1, y: 0.2},
                {x: 0.1, y: 0.3},
            ];

            return client.connectAndEnter().mergeMap(() => {
                return client2.connectAndEnter();
            }).map(() => {
                client.listenEvent(serverRoute);

                cursorPositions.forEach((data) => {
                    client2.client.emit(clientRoute, {pos: data});
                });
            }).delay(30).map(() => {
                const events = client.receivedEvents.get(serverRoute);
                expect(events).toBeDefined();
                expect(events!.length).toBe(3);

                events!.forEach((event) => {
                    expect(typeof event.roomId).toBe('string');
                    expect(event.roomId).toBe(client2.transactions[1][1].body.room.id);
                    expect(typeof event.activeUserId).toBe('string');
                    expect(event.activeUserId).toBe(client2.activeUser!.id);
                    expect(cursorPositions).toContainEqual(event.pos);
                });
            }).first().toPromise();
        });
    });
});
