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
import { ActiveUserRoomData, Room, RoomDocument, RoomEvent, Structure, StructureData } from './models';

export class Service {
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
            return this.createRoom(rootUser, Uuid(), {title: 'mazenet'});
        }).mergeMap((room: Room) => {
                return Observable.forkJoin(Observable.of(room), this.dataStore.setRootRoomId(room.id));
            }).mergeMap(([room]: [Room, null]) => {
                const enterTunnel: Api.v1.Models.Structure.Blueprint = {
                    data: {
                        sType: 'tunnel',
                        sourceText: 'enter',
                        targetText: 'welcome to the mazenet'
                    },
                    pos: {x: 0.5, y: 0.5}
                };
                return Observable.forkJoin(Observable.of(room), this.createStructure(rootUser, room.id, enterTunnel));
            }).mergeMap(([room]: [Room, Structure]) => {
                GlobalLogger.trace('init root room', {room});
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
            stylesheet: '',
            title: roomBlueprint.title
        });

        return this.dataStore.insertRoom(newRoom).map((room) => {
            GlobalLogger.trace('create room', {room});
            return room;
        });
    }

    public createStructure(
        user: User,
        roomId: Api.v1.Models.Room.Id,
        structureBlueprint: Api.v1.Models.Structure.Blueprint
    ): Observable<Structure> {
        //TODO: make this logic a dispatch
        let initStructureDataObservable: Observable<StructureData>;
        switch (structureBlueprint.data.sType) {
            case 'tunnel':
                initStructureDataObservable = this.initTunnel(user, roomId, structureBlueprint.data);
                break;
            default:
                throw new Error(`Failed to create ${structureBlueprint.data.sType}. Unrecognized structure type: '${structureBlueprint.data.sType}'`);
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
                roomId,
                structure,
                user,
            });
            GlobalLogger.trace('create structure', {structure});
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

    public getActiveUsersInRoom(roomId: Room.Id): Observable<Map<ActiveUser.Id, ActiveUserRoomData>> {
        return this.activeUserRoomDataStore.getActiveUsersInRoom(roomId);
    }

    public getActiveUserRoomData(activeUserId: ActiveUser.Id): Observable<ActiveUserRoomData | undefined> {
        return this.activeUserRoomDataStore.getActiveUserRoomData(activeUserId);
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
            title: tunnelBlueprintData.sourceText
        }).map((room: Room) => {
            return tunnelData;
        });
    }
}
