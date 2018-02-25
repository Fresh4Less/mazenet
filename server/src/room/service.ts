import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/catch';

import * as Uuid from 'uuid/v4';

import * as Api from '../../../common/api';

import { GlobalLogger } from '../util/logger';
import { NotFoundError } from '../common';
import { DataStore } from './datastore';
import { RoomDocument, Room, Structure, StructureData, ActiveUserRoomData, RoomEvent } from './models';
import { Service as CursorService} from '../cursor-recording/service';
import { User, ActiveUser} from '../user/models';

export class Service {
    dataStore: DataStore;
    cursorService: CursorService;
    events: Observable<RoomEvent>;

    private eventObserver: Observer<RoomEvent>;

    constructor(dataStore: DataStore, cursorService: CursorService) {
        this.dataStore = dataStore;
        this.cursorService = cursorService;
        this.events = Observable.create((observer: Observer<RoomEvent>) => {
            this.eventObserver = observer;
        }).share();
    }

    initRootRoom(): Observable<Room> {
        let rootUser = {
            id: Uuid(),
            username: 'mazenet'
        };

        return this.createRoom(rootUser, Uuid(), {title: 'mazenet'})
            .mergeMap((room: Room) => {
                return Observable.forkJoin(Observable.of(room), this.dataStore.setRootRoomId(room.id));
            }).mergeMap(([room]: [Room, null]) => {
                let enterTunnel: Api.v1.Models.Structure.Blueprint = {
                    pos: {x: 0.5, y: 0.5},
                    data: {
                        sType: 'tunnel',
                        sourceText: 'enter',
                        targetText: 'welcome to the mazenet'
                    }
                };
                return Observable.forkJoin(Observable.of(room), this.createStructure(rootUser, room.id, enterTunnel));
            }).mergeMap(([room]: [Room, Structure]) => {
                GlobalLogger.trace('init root room', {room});
                return Observable.of(room);
            });
    }

    getRootRoom(): Observable<Room> {
        return this.dataStore.getRootRoom()
            .catch((err: Error) => {
                if (err instanceof NotFoundError) {
                    return this.initRootRoom();
                }
                throw err;
            });
    }

    getRoom(roomId: Room.Id): Observable<Room> {
        return this.dataStore.getRoom(roomId);
    }

    getRoomDocument(room: Room): Observable<RoomDocument> {
        return this.dataStore.getRoomDocument(room);
    }

    createRoom(user: User, roomId: Room.Id, roomBlueprint: Room.Blueprint): Observable<Room> {
        let room = new Room({
            id: roomId,
            creator: user.id,
            title: roomBlueprint.title,
            owners: new Set<User.Id>([user.id]),
            stylesheet: ''
        });

        return this.dataStore.insertRoom(room).map((room) => {
            GlobalLogger.trace('create room', {room});
            return room;
        });
    }

    createStructure(user: User, roomId: Api.v1.Models.Room.Id, structureBlueprint: Api.v1.Models.Structure.Blueprint): Observable<Structure> {
        return this.dataStore.getRoom(roomId).mergeMap((room: Room) => {
            //TODO: make this logic a dispatch
            let initStructureDataObservable;
            switch(structureBlueprint.data.sType) {
                case 'tunnel':
                    initStructureDataObservable = this.initTunnel(user, roomId, structureBlueprint.data);
                    break;
                default:
                    throw new Error(`Failed to create ${structureBlueprint.data.sType}. Unrecognized structure type: '${structureBlueprint.data.sType}'`);
            }
            return Observable.forkJoin(initStructureDataObservable, Observable.of(room));
        }).mergeMap(([structureData, room]: [StructureData, Room]) => {
            let structure = new Structure({
                id: Uuid(),
                creator: user.id,
                pos: structureBlueprint.pos,
                data: structureData,
            });

            return this.dataStore.insertStructure(structure);
        }).map((structure) => {
            GlobalLogger.trace('create structure', {structure});
            return structure;
        });
    }

    enterRoom(roomId: Room.Id, activeUser: ActiveUser): Observable<null> {
        return this.exitRoom(activeUser.id)
        .mergeMap(() => {
            let activeUserRoomData = {
                activeUser: activeUser,
                roomId: roomId,
                enterTime: new Date().toISOString()
            };
            return Observable.forkJoin(
                this.dataStore.insertActiveUserToRoom(roomId, activeUserRoomData),
                this.cursorService.startCursorRecording(activeUser.id, roomId));
        }).map(() => {
            this.eventObserver.next({event: 'enter', roomId, activeUser});
            GlobalLogger.trace('enter room', {roomId, activeUser});
            return null;
        });
    }

    exitRoom(activeUserId: ActiveUser.Id): Observable<null> {
        return this.dataStore.getActiveUserRoomData(activeUserId)
        .mergeMap((activeUserRoomData: ActiveUserRoomData | undefined) => {
            if(activeUserRoomData) {
                return Observable.forkJoin(
                    this.dataStore.deleteActiveUserFromRoom(activeUserRoomData.roomId, activeUserId),
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

    getActiveUsersInRoom(roomId: Room.Id): Observable<Map<ActiveUser.Id, ActiveUserRoomData>> {
        return this.dataStore.getActiveUsersInRoom(roomId);
    }

    getActiveUserRoomData(activeUserId: ActiveUser.Id): Observable<ActiveUserRoomData | undefined> {
        return this.dataStore.getActiveUserRoomData(activeUserId);
    }

    /** Creates a new room and returns the data for a tunnel that leads to it */
    protected initTunnel(user: User, roomId: Room.Id, tunnelBlueprintData: Api.v1.Models.StructureDataBlueprint.Tunnel): Observable<StructureData.Tunnel> {
        let tunnelData = new StructureData.Tunnel({
            sType: tunnelBlueprintData.sType,
            sourceId: roomId,
            targetId: Uuid(),
            sourceText: tunnelBlueprintData.sourceText,
            targetText: tunnelBlueprintData.targetText,
        });

        return this.createRoom(user, tunnelData.targetId, {
            title: tunnelBlueprintData.sourceText
        }).map((room: Room) => {
            return tunnelData;
        });
    }
}
