import 'rxjs/add/observable/of';
import { Observable } from 'rxjs/Observable';

import { AlreadyExistsError, NotFoundError } from '../../common';

import { ActiveUser } from '../../user/models';
import { ActiveUserRoomData, Room, RoomDocument, Structure } from '../models';

import { DataStore } from './index';

// Patch only defined in API
import * as Api from '../../../../common/api';

export class InMemoryDataStore implements DataStore {
    public rootRoomId?: string;
    public rooms: Map<Room.Id, Room>;
    public structures: Map<Structure.Id, Structure>;

    public structuresInRoom: Map<Room.Id, Set<Structure.Id>>;

    public activeUserRoomData: Map<ActiveUser.Id, ActiveUserRoomData>;
    public roomActiveUsers: Map<Room.Id, Map<ActiveUser.Id, ActiveUserRoomData>>;

    constructor() {
        this.rooms = new Map<Room.Id, Room>();
        this.structures = new Map<Structure.Id, Structure>();

        this.structuresInRoom = new Map<Room.Id, Set<Structure.Id>>();

        this.activeUserRoomData = new Map<ActiveUser.Id, ActiveUserRoomData>();
        this.roomActiveUsers = new Map<Room.Id, Map<ActiveUser.Id, ActiveUserRoomData>>();

    }

    public getRootRoomId() {
        if(!this.rootRoomId) {
            return Observable.throw(new NotFoundError(`Root room id not set`));
        }
        return Observable.of(this.rootRoomId!);
    }

    public setRootRoomId(roomId: Room.Id) {
        this.rootRoomId = roomId;
        return Observable.of(null);
    }

    public getRoom(roomId: Room.Id) {
        const room = this.rooms.get(roomId);
        if(!room) {
            return Observable.throw(new NotFoundError(`Room '${roomId}' not found`)) as Observable<Room>;
        }

        return Observable.of(room);
    }

    public insertRoom(room: Room) {
        if(this.rooms.has(room.id)) {
            return Observable.throw(new AlreadyExistsError(`Room with id '${room.id}' already exists`)) as Observable<Room>;
        }

        this.rooms.set(room.id, room);
        return Observable.of(room);
    }

    public updateRoom(updatedRoom: Room) {
        const room = this.rooms.get(updatedRoom.id);
        if(!room) {
            return Observable.throw(new NotFoundError(`Room '${updatedRoom.id}' not found`)) as Observable<Room>;
        }

        this.rooms.set(room.id, updatedRoom);
        return Observable.of(room);
    }

    public getStructure(id: Structure.Id) {
        const structure = this.structures.get(id);
        if(!structure) {
            return Observable.throw(new NotFoundError(`Structure '${id}' not found`)) as Observable<Structure>;
        }

        return Observable.of(structure);
    }

    public updateStructure(id: Structure.Id, patch: Api.v1.Models.Structure.Patch) {
        const structure = this.structures.get(id);
        if(!structure) {
            return Observable.throw(new NotFoundError(`Structure '${id}' not found`)) as Observable<Structure>;
        }

        // NOTE: fields that were explciitly set to undefined will overwrite
        // delete data so it doesn't overwrite the StructureData class
        const patchStructureData = patch.data;
        delete patch.data;
        Object.assign(structure, patch);
        // TODO: do this with a generic recursive function
        if(patchStructureData) {
            Object.assign(structure.data, patchStructureData);
        }

        return Observable.of(structure);
    }

    public insertStructure(structure: Structure) {
        if(this.structures.has(structure.id)) {
            return Observable.throw(new AlreadyExistsError(`Structure with id '${structure.id}' already exists`)) as Observable<Structure>;
        }

        this.structures.set(structure.id, structure);

        // establish structure-room relations. each structure type can map to rooms in a unique way
        switch (structure.data.sType) {
            case 'tunnel':
                let sourceRoomStructures = this.structuresInRoom.get(structure.data.sourceId);
                if(!sourceRoomStructures) {
                    sourceRoomStructures = new Set<Structure.Id>();
                    this.structuresInRoom.set(structure.data.sourceId, sourceRoomStructures);
                }
                sourceRoomStructures.add(structure.id);
                let targetRoomStructures = this.structuresInRoom.get(structure.data.targetId);
                if(!targetRoomStructures) {
                    targetRoomStructures = new Set<Structure.Id>();
                    this.structuresInRoom.set(structure.data.targetId, targetRoomStructures);
                }
                targetRoomStructures.add(structure.id);
                break;
            default:
                break;
        }

        return Observable.of(structure);
    }

    public getRoomDocument(roomId: Room.Id) {
        return this.getRoom(roomId)
        .map((room) => {
            const structureIds = this.structuresInRoom.get(roomId) || new Set<Structure.Id>();
            const structures = new Map<Structure.Id, Structure>();
            for (const id of structureIds) {
                // the structure better exist
                structures.set(id, this.structures.get(id)!);
            }
            return new RoomDocument(room, structures);
        });
    }

    public getActiveUsersInRoom(roomId: Room.Id) {
        let roomActiveUsers = this.roomActiveUsers.get(roomId);
        if(!roomActiveUsers) {
            roomActiveUsers = new Map<ActiveUser.Id, ActiveUserRoomData>();
        }
        return Observable.of(roomActiveUsers);
    }

    public getActiveUserRoomData(activeUserId: ActiveUser.Id) {
        const activeUserRoomData = this.activeUserRoomData.get(activeUserId);
        return Observable.of(activeUserRoomData);
    }

    public insertActiveUserToRoom(roomId: Room.Id, activeUserRoomData: ActiveUserRoomData) {
        if(!this.roomActiveUsers.has(roomId)) {
            this.roomActiveUsers.set(roomId, new Map<ActiveUser.Id, ActiveUserRoomData>());
        }

        const roomActiveUsers = this.roomActiveUsers.get(roomId);
        if(roomActiveUsers!.has(activeUserRoomData.activeUser.id)) {
            return Observable.throw(new AlreadyExistsError(`ActiveUser '${activeUserRoomData.activeUser.id}' is already in room '${roomId}'`)) as Observable<null>;
        }
        roomActiveUsers!.set(activeUserRoomData.activeUser.id, activeUserRoomData);
        this.activeUserRoomData.set(activeUserRoomData.activeUser.id, activeUserRoomData);
        return Observable.of(null);
    }

    public deleteActiveUserFromRoom(roomId: Room.Id, activeUserId: ActiveUser.Id) {
        const roomActiveUsers = this.roomActiveUsers.get(roomId);
        if(!roomActiveUsers || !roomActiveUsers.has(activeUserId)) {
            return Observable.throw(new NotFoundError(`ActiveUser '${activeUserId}' is not in room '${roomId}'`)) as Observable<null>;
        }
        roomActiveUsers.delete(activeUserId);
        if(roomActiveUsers.size === 0) {
            this.roomActiveUsers.delete(roomId);
        }
        this.activeUserRoomData.delete(activeUserId);
        return Observable.of(null);
    }
}
