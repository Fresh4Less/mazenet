import { forkJoin, merge, of, Observable, Subject, throwError } from 'rxjs';
import { catchError, map, mergeMap, share, tap } from 'rxjs/operators';

import * as Uuid from 'uuid/v4';

import * as Api from '../../../common/api';

import { NotFoundError } from '../common';
import { Service as CursorService } from '../cursor-recording/service';
import { ActiveUser, User } from '../user/models';
import { Service as UserService } from '../user/service';
import { GlobalLogger } from '../util/logger';
import { ActiveUserRoomDataStore, DataStore } from './datastore';
import { ActiveUserRoomData, getStructureRoomIds, Room, RoomDocument, RoomEvent, Structure, StructureData } from './models';

/** blueprints to create structures in a subtree of rooms */
export interface StructureBlueprintTree {
    structure: Api.v1.Models.Structure.Blueprint;
    children?: StructureBlueprintTree[];
    // if the structure is a tunnel, the created tunnel will be edited with the room patch on creation
    roomPatch?: Api.v1.Models.Room.Patch;
}

export class Service {

    /** Produces a stylesheet with a .room selector containing a gradient background of two randomly chosen colors
     *  and at a randomly chosen angle.
     *  TODO: Add more variety of background types rather than gradients.
     */
    private static generateRandomStylesheet(): Api.v1.Models.Stylesheet {
        const r = (max: number) => {
            return Math.floor(Math.random() * Math.floor(max));
        };
        return {
            rules: [
                {
                    properties: {
                        background: `linear-gradient(${r(180)}deg, rgb(${r(256)}, ${r(256)}, ${r(256)}),` +
                        `rgb(${r(256)}, ${r(256)}, ${r(256)}))`
                    },
                    selectors: ['.room']
                }
            ]
        };
    }

    public dataStore: DataStore;
    public activeUserRoomDataStore: ActiveUserRoomDataStore;
    public userService: UserService;
    public cursorService: CursorService;
    public events: Observable<RoomEvent>;

    private eventSubject: Subject<RoomEvent>;

    constructor(dataStore: DataStore, activeUserRoomDataStore: ActiveUserRoomDataStore, userService: UserService, cursorService: CursorService) {
        this.dataStore = dataStore;
        this.activeUserRoomDataStore = activeUserRoomDataStore;
        this.userService = userService;
        this.cursorService = cursorService;
        this.eventSubject = new Subject();
        this.events = this.eventSubject.pipe(share());
    }

    public initRootRoom(): Observable<Room> {
        let rootUser: User;
        return this.userService.getRootUser().pipe(
            mergeMap((user) => {
                rootUser = user;
                return this.createRoom(rootUser.id, Uuid(), {
                    stylesheet: Service.generateRandomStylesheet(),
                    title: 'The Root Room'
                });
            }),
            mergeMap((room: Room) => {
                return forkJoin(of(room), this.dataStore.setRootRoomId(room.id));
            }),
            mergeMap(([room]: [Room, null]) => {
                return forkJoin(of(room), this.createStructureTrees(rootUser.id, room.id, Service.entranceSubTrees));
            }),
            mergeMap(([room, events]: [Room, Structure | Room]) => {
                GlobalLogger.trace('init root room', {room, rootUserId: rootUser.id});
                return of(room);
            })
        );
    }

    public getRootRoomId(): Observable<Room.Id> {
        return this.dataStore.getRootRoomId().pipe(
            catchError((err: Error) => {
                if(err instanceof NotFoundError) {
                    return this.initRootRoom().pipe(
                        map((room) => room.id)
                    );
                }

                return throwError(err) as Observable<Room.Id>;
            })
        );
    }

    public getRoomDocument(roomId: Room.Id): Observable<RoomDocument> {
        return this.dataStore.getRoomDocument(roomId);
    }

    public createRoom(userId: User.Id, roomId: Room.Id, roomBlueprint: Room.Blueprint): Observable<Room> {
        const newRoom = new Room({
            creator: userId,
            id: roomId,
            owners: new Set<User.Id>([userId]),
            stylesheet: roomBlueprint.stylesheet,
            title: roomBlueprint.title
        });

        return this.dataStore.insertRoom(newRoom).pipe(
            map((room) => {
                GlobalLogger.trace('create room', {room, userId: userId});
                return room;
            })
        );
    }

    public createStructure(
        userId: User.Id,
        roomId: Api.v1.Models.Room.Id,
        structureBlueprint: Api.v1.Models.Structure.Blueprint
    ): Observable<Structure> {
        //TODO: make this logic a dispatch?
        let initStructureDataObservable: Observable<StructureData>;
        switch (structureBlueprint.data.sType) {
            case 'tunnel':
                initStructureDataObservable = this.initTunnel(userId, roomId, structureBlueprint.data);
                break;
            case 'text':
                initStructureDataObservable = of(new StructureData.Text(
                    Object.assign({}, structureBlueprint.data, {roomId})));
                break;
            default:
                throw new Error(`Failed to create ${(structureBlueprint.data as StructureData).sType}: unrecognized structure type`);
        }
        return initStructureDataObservable.pipe(
            mergeMap((structureData) => {
                const structure = new Structure({
                    creator: userId,
                    data: structureData,
                    id: Uuid(),
                    pos: structureBlueprint.pos,
                });

                return this.dataStore.insertStructure(structure);
            }),
            map((structure) => {
                this.eventSubject.next({
                    event: 'structure-create',
                    roomIds: getStructureRoomIds(structure),
                    structure,
                    userId,
                });
                GlobalLogger.trace('create structure', {structure, userId: userId});
                return structure;
            })
        );
    }

    public updateStructure(
        userId: User.Id,
        id: Api.v1.Models.Structure.Id,
        patch: Api.v1.Models.Structure.Patch
    ): Observable<Structure> {
        return this.dataStore.updateStructure(id, patch).pipe(
            map((structure) => {
                this.eventSubject.next({
                    event: 'structure-update',
                    roomIds: getStructureRoomIds(structure),
                    structure,
                    userId,
                });
                GlobalLogger.trace('update structure', {structureId: id, patch, userId: userId});
                return structure;
            })
        );
    }

    public enterRoom(roomId: Room.Id, activeUser: ActiveUser): Observable<null> {
        return of(null).pipe(
            tap(() => {
                // exit the current room, but don't block the observable
                this.exitRoom(activeUser.id).subscribe({
                    error: (err) => {
                        GlobalLogger.error('Failed to exit room', {roomId, activeUser, error: err});
                    }
                });
            }),
            mergeMap(() => {
                const activeUserRoomData = {
                    activeUser,
                    enterTime: new Date().toISOString(),
                    roomId,
                };
                return forkJoin(
                    this.activeUserRoomDataStore.insertActiveUserToRoom(roomId, activeUserRoomData),
                    this.cursorService.startCursorRecording(activeUser.id, roomId));
            }),
            map(() => {
                this.eventSubject.next({event: 'enter', roomId, activeUser});
                GlobalLogger.trace('enter room', {roomId, activeUser});
                return null;
            })
        );
    }

    public exitRoom(activeUserId: ActiveUser.Id): Observable<null> {
        return this.activeUserRoomDataStore.getActiveUserRoomData(activeUserId).pipe(
            mergeMap((activeUserRoomData: ActiveUserRoomData | undefined) => {
                if(activeUserRoomData) {
                    return forkJoin(
                        this.activeUserRoomDataStore.deleteActiveUserFromRoom(activeUserRoomData.roomId, activeUserId),
                        this.cursorService.endCursorRecording(activeUserId)).pipe(
                            map(() => {
                                this.eventSubject.next({event: 'exit', roomId: activeUserRoomData.roomId, activeUser: activeUserRoomData.activeUser});
                                GlobalLogger.trace('exit room', {roomId: activeUserRoomData.roomId, activeUser: activeUserRoomData.activeUser});
                                return null;
                            })
                        );
                }
                return of(null);
            })
        );
    }

    public updateRoom(
        userId: User.Id,
        id: Api.v1.Models.Room.Id,
        patch: Api.v1.Models.Room.Patch
    ): Observable<Room> {
        return this.dataStore.updateRoom(id, patch).pipe(
            map((room) => {
                this.eventSubject.next({
                    event: 'update',
                    room,
                    userId,
                });
                GlobalLogger.trace('update room', {roomId: id, patch, userId: userId});
                return room;
            })
        );
    }

    public getActiveUsersInRoom(roomId: Room.Id): Observable<Map<ActiveUser.Id, ActiveUserRoomData>> {
        return this.activeUserRoomDataStore.getActiveUsersInRoom(roomId);
    }

    public getActiveUserRoomData(activeUserId: ActiveUser.Id): Observable<ActiveUserRoomData | undefined> {
        return this.activeUserRoomDataStore.getActiveUserRoomData(activeUserId);
    }

    protected createStructureTrees(userId: User.Id, roomId: Room.Id, structureTrees: StructureBlueprintTree[]): Observable<Structure | Room> {
        return merge(...structureTrees.map((tree) => {
            return this.createStructure(userId, roomId, tree.structure).pipe(
                mergeMap((structure: Structure) => {
                    let childRoomId: Room.Id | undefined;
                    switch(structure.data.sType) {
                        case 'tunnel':
                            childRoomId = structure.data.targetId;
                            break;
                        default:
                            break;
                    }
                    const observables: Array<Observable<Structure | Room>> = [of(structure)];
                    if(childRoomId) {
                        if(tree.roomPatch) {
                            observables.push(this.updateRoom(userId, childRoomId, tree.roomPatch));
                        }
                        if(tree.children) {
                            observables.push(this.createStructureTrees(userId, childRoomId, tree.children).pipe(
                                map((subStructures) => structure)
                            ));
                        }
                    }
                    return merge(...observables);
                })
            );
        }));
    }

    /** Creates a new room and returns the data for a tunnel that leads to it */
    protected initTunnel(
        userId: User.Id,
        roomId: Room.Id,
        tunnelBlueprintData: Api.v1.Models.StructureDataBlueprint.Tunnel
    ): Observable<StructureData.Tunnel> {
        const tunnelData = new StructureData.Tunnel({
            sType: tunnelBlueprintData.sType,
            sourceId: roomId,
            sourceText: tunnelBlueprintData.sourceText,
            targetId: Uuid(),
            targetText: tunnelBlueprintData.targetText,
        });

        return this.createRoom(userId, tunnelData.targetId, {
            stylesheet: Service.generateRandomStylesheet(),
            title: tunnelBlueprintData.sourceText
        }).pipe(
            map((room: Room) => {
                return tunnelData;
            })
        );
    }

    /* tslint:disable:object-literal-sort-keys member-ordering */
    private static entranceSubTrees: StructureBlueprintTree[] = [{
        structure: {
            data: {
                sType: 'tunnel',
                sourceText: 'WELCOME PARTY',
                targetText: 'leave the party',
            },
            pos: {x: 0.48, y: 0.2}
        }
    }, {
        structure: {
            data: {
                sType: 'tunnel',
                sourceText: 'ADVENTURE ZONE',
                targetText: 'back to root',
            },
            pos: {x: 0.2, y: 0.8}
        },
        children: [{
            structure: {
                data: {
                    sType: 'text',
                    text: 'avast ye matey',
                    width: 0.3,
                },
                pos: {x: 0.5, y: 0.5}
            }
        }, {
            structure: {
                data: {
                    sType: 'tunnel',
                    sourceText: 'creepy cavern',
                    targetText: 'to safety',
                },
                pos: {x: 0.2, y: 0.2}
            },
            roomPatch: {
                title: '--e-py ca--r-',
                stylesheet: {
                    rules: [{
                        selectors: ['.room'],
                        properties: {
                            background: '#111111',
                        },
                    }, {
                        selectors: ['.structure'],
                        properties: {
                            color: '#ffffff',
                        }
                    }]
                }
            },
            children: [{
                structure: {
                    data: {
                        sType: 'text',
                        text: `it's too dark to go any deeper`,
                        width: 0.6,
                    },
                    pos: {x: 0.3, y: 0.7}
                }
            }]
        }]
    }, {
            structure: {
                data: {
                    sType: 'tunnel',
                    sourceText: 'MYSTERIOUS MANOR',
                    targetText: 'back where ye came from',
                },
                pos: {x: 0.7, y: 0.8}
            }

    }, {
        structure: {
            data: {
                sType: 'text',
                text: 'Welcome to the Mazenet.\n\nThis is the root room.\n\nFrom here you can begin your journey of ' +
                'exploration, creativity, and socialization. Click any tunnel link to go exploring or try out a ' +
                'tool on the toolbar.\n\nThe ghostly cursors floating around are recordings of you and other users ' +
                'exploring the Mazenet.',
                width: 0.2
            },
            pos: {x: 0.42, y: 0.41}
        }
    }];
    /* tslint:enable:object-literal-sort-keys, member-ordering */
}
