import { of, throwError, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AlreadyExistsError, NotFoundError } from '../../common';

import { ActiveUser, User } from '../../user/models';
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
            return throwError(new NotFoundError(`Root room id not set`));
        }
        return of(this.rootRoomId!);
    }

    public setRootRoomId(roomId: Room.Id) {
        this.rootRoomId = roomId;
        return of(null);
    }

    public getRoom(roomId: Room.Id) {
        const room = this.rooms.get(roomId);
        if(!room) {
            return throwError(new NotFoundError(`Room '${roomId}' not found`)) as Observable<Room>;
        }

        return of(room);
    }

    public insertRoom(room: Room) {
        if(this.rooms.has(room.id)) {
            return throwError(new AlreadyExistsError(`Room with id '${room.id}' already exists`)) as Observable<Room>;
        }

        this.rooms.set(room.id, room);
        return of(room);
    }

    public updateRoom(id: Room.Id, patch: Api.v1.Models.Room.Patch) {
        const room = this.rooms.get(id);
        if(!room) {
            return throwError(new NotFoundError(`Room '${id}' not found`)) as Observable<Room>;
        }

        // NOTE: fields that were explciitly set to undefined will overwrite
        Object.assign(room, patch);
        if(patch.owners) {
            room.owners = new Set<User.Id>(patch.owners);
        }

        return of(room);
    }

    public getStructure(id: Structure.Id) {
        const structure = this.structures.get(id);
        if(!structure) {
            return throwError(new NotFoundError(`Structure '${id}' not found`)) as Observable<Structure>;
        }

        return of(structure);
    }

    public updateStructure(id: Structure.Id, patch: Api.v1.Models.Structure.Patch) {
        const structure = this.structures.get(id);
        if(!structure) {
            return throwError(new NotFoundError(`Structure '${id}' not found`)) as Observable<Structure>;
        }

        // NOTE: fields that were explciitly set to undefined will overwrite
        // delete data so it doesn't overwrite the StructureData class
        const patchStructureData = patch.data;
        const patchBase: Omit<Api.v1.Models.Structure.Patch, 'data'> = patch;
        delete (patchBase as any).data;
        Object.assign(structure, patchBase);
        // TODO: do this with a generic recursive function
        if(patchStructureData) {
            Object.assign(structure.data, patchStructureData);
        }

        return of(structure);
    }

    public insertStructure(structure: Structure) {
        if(this.structures.has(structure.id)) {
            return throwError(new AlreadyExistsError(`Structure with id '${structure.id}' already exists`)) as Observable<Structure>;
        }

        this.structures.set(structure.id, structure);

        // establish structure-room relations. each structure type can map to rooms in a unique way
        switch (structure.data.sType) {
            case 'tunnel':
                this.addStructureToRoom(structure.id, structure.data.sourceId);
                this.addStructureToRoom(structure.id, structure.data.targetId);
                break;
            case 'text':
                this.addStructureToRoom(structure.id, structure.data.roomId);
                break;
            default:
                break;
        }

        return of(structure);
    }

    public getRoomDocument(roomId: Room.Id) {
        return this.getRoom(roomId).pipe(
            map((room) => {
                const structureIds = this.structuresInRoom.get(roomId) || new Set<Structure.Id>();
                const structures = new Map<Structure.Id, Structure>();
                for (const id of structureIds) {
                    // the structure better exist
                    structures.set(id, this.structures.get(id)!);
                }
                return new RoomDocument(room, structures);
            })
        );
    }

    public getActiveUsersInRoom(roomId: Room.Id) {
        let roomActiveUsers = this.roomActiveUsers.get(roomId);
        if(!roomActiveUsers) {
            roomActiveUsers = new Map<ActiveUser.Id, ActiveUserRoomData>();
        }
        return of(roomActiveUsers);
    }

    public getActiveUserRoomData(activeUserId: ActiveUser.Id) {
        const activeUserRoomData = this.activeUserRoomData.get(activeUserId);
        return of(activeUserRoomData);
    }

    public insertActiveUserToRoom(roomId: Room.Id, activeUserRoomData: ActiveUserRoomData) {
        if(!this.roomActiveUsers.has(roomId)) {
            this.roomActiveUsers.set(roomId, new Map<ActiveUser.Id, ActiveUserRoomData>());
        }

        const roomActiveUsers = this.roomActiveUsers.get(roomId);
        if(roomActiveUsers!.has(activeUserRoomData.activeUser.id)) {
            return throwError(new AlreadyExistsError(`ActiveUser '${activeUserRoomData.activeUser.id}' is already in room '${roomId}'`)) as Observable<null>;
        }
        roomActiveUsers!.set(activeUserRoomData.activeUser.id, activeUserRoomData);
        this.activeUserRoomData.set(activeUserRoomData.activeUser.id, activeUserRoomData);
        return of(null);
    }

    public deleteActiveUserFromRoom(roomId: Room.Id, activeUserId: ActiveUser.Id) {
        const roomActiveUsers = this.roomActiveUsers.get(roomId);
        if(!roomActiveUsers || !roomActiveUsers.has(activeUserId)) {
            return throwError(new NotFoundError(`ActiveUser '${activeUserId}' is not in room '${roomId}'`)) as Observable<null>;
        }
        roomActiveUsers.delete(activeUserId);
        if(roomActiveUsers.size === 0) {
            this.roomActiveUsers.delete(roomId);
        }
        this.activeUserRoomData.delete(activeUserId);
        return of(null);
    }

    protected addStructureToRoom(structureId: Structure.Id, roomId: Room.Id): Set<Structure.Id> {
        let structures = this.structuresInRoom.get(roomId);
        if(!structures) {
            structures = new Set<Structure.Id>();
            this.structuresInRoom.set(roomId, structures);
        }

        structures.add(structureId);
        return structures;
    }
}
