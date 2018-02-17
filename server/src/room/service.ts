import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/catch';

import * as Uuid from 'uuid/v4';

import * as Api from '../../../common/api';

import { NotFoundError } from '../common';
import { DataStore } from './datastore';
import { RoomDocument, Room, Structure, StructureData } from './models';
import { User, ActiveUser } from '../user/models';

export class Service {
    dataStore: DataStore;

    constructor(dataStore: DataStore) {
        this.dataStore = dataStore;
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

        return this.dataStore.insertRoom(room);
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
        });
    }

    enterRoom(roomId: Room.Id, activeUser: ActiveUser): Observable<null> {
        return this.exitRoom(activeUser)
        .mergeMap(() => {
            return this.dataStore.insertActiveUserToRoom(roomId, activeUser);
        });
    }

    exitRoom(activeUser: ActiveUser): Observable<null> {
        return this.dataStore.getActiveUserRoomId(activeUser.id)
        .mergeMap((roomId: Room.Id | undefined) => {
            if(roomId) {
                return this.dataStore.deleteActiveUserFromRoom(roomId, activeUser.id);
            }
            return Observable.of(null);
        });
    }

    getActiveUsersInRoom(roomId: Room.Id): Observable<Map<ActiveUser.Id, ActiveUser>> {
        return this.dataStore.getActiveUsersInRoom(roomId);
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
