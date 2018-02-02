import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import { Room, Structure } from './models';
import {ActiveUser} from '../user/models';
import { NotFoundError, AlreadyExistsError } from '../common';

import * as Uuid from 'uuid/v4';

export interface DataStore {
    getRootRoom: () => Observable<Room>;
    setRootRoomId: (roomId: Room.Id) => Observable<null>;

    getRoom: (roomId: Room.Id) => Observable<Room>;
    insertRoom: (room: Room) => Observable<Room>;
    updateRoom: (updatedRoom: Room) => Observable<Room>;

    getStructure: (structureId: Structure.Id) => Observable<Structure>;
    insertStructure: (structure: Structure) => Observable<Structure>;

    getActiveUsersInRoom: (roomId: Room.Id) => Observable<Map<ActiveUser.Id, ActiveUser>>;
    getActiveUserRoomId: (activeUserId: ActiveUser.Id) => Observable<Room.Id | undefined>;
    insertActiveUserToRoom: (roomId: Room.Id, activeUser: ActiveUser) => Observable<null>;
    deleteActiveUserFromRoom: (roomId: Room.Id, activeUserId: ActiveUser.Id) => Observable<null>;
}

export class InMemoryDataStore implements DataStore {
    rootRoomId?: string;
    rooms: Map<Room.Id, Room>;
    structures: Map<Structure.Id, Structure>;

    activeUserRooms: Map<ActiveUser.Id, Room.Id>;
    roomActiveUsers: Map<Room.Id, Map<ActiveUser.Id, ActiveUser>>;

    constructor() {
        this.rooms = new Map<Room.Id, Room>();
        this.structures = new Map<Structure.Id, Structure>();
        this.activeUserRooms = new Map<ActiveUser.Id, Room.Id>();
        this.roomActiveUsers = new Map<Room.Id, Map<ActiveUser.Id, ActiveUser>>();

    }

    getRootRoom() {
        if (!this.rootRoomId) {
            throw new NotFoundError(`Root room id not set`);
        }

        return this.getRoom(this.rootRoomId);
    }

    setRootRoomId(roomId: Room.Id) {
        this.rootRoomId = roomId;
        return Observable.of(null);
    }

    getRoom(roomId: Room.Id) {
        let room = this.rooms.get(roomId);
        if (!room) {
            throw new NotFoundError(`Room '${roomId}' not found`);
        }

        return Observable.of(room);
    }

    insertRoom(room: Room) {
        if (this.rooms.has(room.id)) {
            throw new AlreadyExistsError(`Room with id '${room.id}' already exists`);
        }

        this.rooms.set(room.id, room);
        return Observable.of(room);
    }

    updateRoom(updatedRoom: Room) {
        let room = this.rooms.get(updatedRoom.id);
        if (!room) {
            throw new NotFoundError(`Room '${updatedRoom.id}' not found`);
        }

        this.rooms.set(room.id, updatedRoom);
        return Observable.of(room);
    }

    getStructure(structureId: Structure.Id) {
        let structure = this.structures.get(structureId);
        if (!structure) {
            throw new NotFoundError(`Structure '${structureId}' not found`);
        }

        return Observable.of(structure);
    }

    insertStructure(structure: Structure) {
        if (this.structures.has(structure.id)) {
            throw new AlreadyExistsError(`Structure with id '${structure.id}' already exists`);
        }

        this.structures.set(structure.id, structure);
        return Observable.of(structure);
    }

    getActiveUsersInRoom(roomId: Room.Id) {
        let roomActiveUsers = this.roomActiveUsers.get(roomId);
        if(!roomActiveUsers) {
            roomActiveUsers = new Map<ActiveUser.Id, ActiveUser>();
        }
        return Observable.of(roomActiveUsers);
    }

    getActiveUserRoomId(activeUserId: ActiveUser.Id) {
        let roomId = this.activeUserRooms.get(activeUserId);
        return Observable.of(roomId);
    }

    insertActiveUserToRoom(roomId: Room.Id, activeUser: ActiveUser) {
        if(!this.roomActiveUsers.has(roomId)) {
            this.roomActiveUsers.set(roomId, new Map<ActiveUser.Id, ActiveUser>());
        }

        let roomActiveUsers = this.roomActiveUsers.get(roomId);
        if(roomActiveUsers!.has(activeUser.id)) {
            throw new AlreadyExistsError(`ActiveUser '${activeUser.id}' is already in room '${roomId}'`);
        }
        roomActiveUsers!.set(activeUser.id, activeUser);
        this.activeUserRooms.set(activeUser.id, roomId);
        return Observable.of(null);
    }

    deleteActiveUserFromRoom(roomId: Room.Id, activeUserId: ActiveUser.Id) {
        let roomActiveUsers = this.roomActiveUsers.get(roomId);
        if(!roomActiveUsers || !roomActiveUsers.has(activeUserId)) {
            throw new NotFoundError(`ActiveUser '${activeUserId}' is not in room '${roomId}'`);
        }
        roomActiveUsers.delete(activeUserId);
        this.activeUserRooms.delete(activeUserId);
        return Observable.of(null);
    }
}
