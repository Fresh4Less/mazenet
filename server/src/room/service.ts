import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

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

    private eventObserver: Observer<RoomEvent>;

    constructor(dataStore: DataStore, activeUserRoomDataStore: ActiveUserRoomDataStore, userService: UserService, cursorService: CursorService) {
        this.dataStore = dataStore;
        this.activeUserRoomDataStore = activeUserRoomDataStore;
        this.userService = userService;
        this.cursorService = cursorService;
        this.events = Observable.create((observer: Observer<RoomEvent>) => {
            this.eventObserver = observer;
        }).share();
    }
    public initRootRoom(): Observable<Room> {
        let rootUser: User;
        return this.userService.getRootUser().mergeMap((user) => {
            rootUser = user;
            return this.createRoom(rootUser, Uuid(), {
                stylesheet: Service.generateRandomStylesheet(),
                title: 'The Root Room'
            });
        }).mergeMap((room: Room) => {
                return Observable.forkJoin(Observable.of(room), this.dataStore.setRootRoomId(room.id));
            }).mergeMap(([room]: [Room, null]) => {
                return Observable.forkJoin(Observable.of(room), this.createStructureTrees(rootUser, room.id, Service.entranceSubTrees));
            }).mergeMap(([room, structures]: [Room, Structure[]]) => {
                GlobalLogger.trace('init root room', {room, rootUserId: rootUser.id});
                return Observable.of(room);
            });
    }

    public getRootRoomId(): Observable<Room.Id> {
        return this.dataStore.getRootRoomId()
            .catch((err: Error) => {
                if(err instanceof NotFoundError) {
                    return this.initRootRoom().map((room) => room.id);
                }

                return Observable.throw(err) as Observable<Room.Id>;
            });
    }

    public getRoomDocument(roomId: Room.Id): Observable<RoomDocument> {
        return this.dataStore.getRoomDocument(roomId);
    }

    public createRoom(user: User, roomId: Room.Id, roomBlueprint: Room.Blueprint): Observable<Room> {
        const newRoom = new Room({
            creator: user.id,
            id: roomId,
            owners: new Set<User.Id>([user.id]),
            stylesheet: roomBlueprint.stylesheet,
            title: roomBlueprint.title
        });

        return this.dataStore.insertRoom(newRoom).map((room) => {
            GlobalLogger.trace('create room', {room, userId: user.id});
            return room;
        });
    }

    public createStructure(
        user: User,
        roomId: Api.v1.Models.Room.Id,
        structureBlueprint: Api.v1.Models.Structure.Blueprint
    ): Observable<Structure> {
        //TODO: make this logic a dispatch?
        let initStructureDataObservable: Observable<StructureData>;
        switch (structureBlueprint.data.sType) {
            case 'tunnel':
                initStructureDataObservable = this.initTunnel(user, roomId, structureBlueprint.data);
                break;
            case 'text':
                initStructureDataObservable = Observable.of(new StructureData.Text(
                    Object.assign({}, structureBlueprint.data, {roomId})));
                break;
            default:
                throw new Error(`Failed to create ${(structureBlueprint.data as StructureData).sType}: unrecognized structure type`);
        }
        return initStructureDataObservable
        .mergeMap((structureData) => {
            const structure = new Structure({
                creator: user.id,
                data: structureData,
                id: Uuid(),
                pos: structureBlueprint.pos,
            });

            return this.dataStore.insertStructure(structure);
        }).map((structure) => {
            this.eventObserver.next({
                event: 'structure-create',
                roomIds: getStructureRoomIds(structure),
                structure,
                user,
            });
            GlobalLogger.trace('create structure', {structure, userId: user.id});
            return structure;
        });
    }

    public updateStructure(
        user: User,
        id: Api.v1.Models.Structure.Id,
        patch: Api.v1.Models.Structure.Patch
    ): Observable<Structure> {
        return this.dataStore.updateStructure(id, patch).map((structure) => {
            this.eventObserver.next({
                event: 'structure-update',
                roomIds: getStructureRoomIds(structure),
                structure,
                user,
            });
            GlobalLogger.trace('update structure', {structureId: id, patch, userId: user.id});
            return structure;
        });
    }

    public enterRoom(roomId: Room.Id, activeUser: ActiveUser): Observable<null> {
        return this.exitRoom(activeUser.id)
        .mergeMap(() => {
            const activeUserRoomData = {
                activeUser,
                enterTime: new Date().toISOString(),
                roomId,
            };
            return Observable.forkJoin(
                this.activeUserRoomDataStore.insertActiveUserToRoom(roomId, activeUserRoomData),
                this.cursorService.startCursorRecording(activeUser.id, roomId));
        }).map(() => {
            this.eventObserver.next({event: 'enter', roomId, activeUser});
            GlobalLogger.trace('enter room', {roomId, activeUser});
            return null;
        });
    }

    public exitRoom(activeUserId: ActiveUser.Id): Observable<null> {
        return this.activeUserRoomDataStore.getActiveUserRoomData(activeUserId)
        .mergeMap((activeUserRoomData: ActiveUserRoomData | undefined) => {
            if(activeUserRoomData) {
                return Observable.forkJoin(
                    this.activeUserRoomDataStore.deleteActiveUserFromRoom(activeUserRoomData.roomId, activeUserId),
                    this.cursorService.endCursorRecording(activeUserId))
                .map(() => {
                    this.eventObserver.next({event: 'exit', roomId: activeUserRoomData.roomId, activeUser: activeUserRoomData.activeUser});
                    GlobalLogger.trace('exit room', {roomId: activeUserRoomData.roomId, activeUser: activeUserRoomData.activeUser});
                    return null;
                });
            }
            return Observable.of(null);
        });
    }

    public updateRoom(
        user: User,
        id: Api.v1.Models.Room.Id,
        patch: Api.v1.Models.Room.Patch
    ): Observable<Room> {
        return this.dataStore.updateRoom(id, patch).map((room) => {
            this.eventObserver.next({
                event: 'update',
                room,
                user,
            });
            GlobalLogger.trace('update room', {roomId: id, patch, userId: user.id});
            return room;
        });
    }

    public getActiveUsersInRoom(roomId: Room.Id): Observable<Map<ActiveUser.Id, ActiveUserRoomData>> {
        return this.activeUserRoomDataStore.getActiveUsersInRoom(roomId);
    }

    public getActiveUserRoomData(activeUserId: ActiveUser.Id): Observable<ActiveUserRoomData | undefined> {
        return this.activeUserRoomDataStore.getActiveUserRoomData(activeUserId);
    }

    protected createStructureTrees(user: User, roomId: Room.Id, structureTrees: StructureBlueprintTree[]): Observable<Structure[]> {
        return Observable.forkJoin(structureTrees.map((tree) => {
            return this.createStructure(user, roomId, tree.structure).mergeMap((structure: Structure) => {
                let childRoomId: Room.Id | undefined;
                switch(structure.data.sType) {
                    case 'tunnel':
                        childRoomId = structure.data.targetId;
                        break;
                    default:
                        break;
                }
                if(tree.children && childRoomId) {
                    return this.createStructureTrees(user, childRoomId, tree.children).map((subStructures) => structure);
                }
                return Observable.of(structure);
            });
        }));
    }

    /** Creates a new room and returns the data for a tunnel that leads to it */
    protected initTunnel(
        user: User,
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

        return this.createRoom(user, tunnelData.targetId, {
            stylesheet: Service.generateRandomStylesheet(),
            title: tunnelBlueprintData.sourceText
        }).map((room: Room) => {
            return tunnelData;
        });
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
        }
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
