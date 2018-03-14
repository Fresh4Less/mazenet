import 'rxjs/add/observable/of';
import { Observable } from 'rxjs/Observable';

import { AlreadyExistsError, NotFoundError } from '../../common';

import { ActiveUser } from '../../user/models';
import { ActiveUserRoomData, Room, RoomDocument, Structure } from '../models';

import { ActiveUserRoomDataStore } from './index';

export class InMemoryActiveUserRoomDataStore implements ActiveUserRoomDataStore {
    public activeUserRoomData: Map<ActiveUser.Id, ActiveUserRoomData>;
    public roomActiveUsers: Map<Room.Id, Map<ActiveUser.Id, ActiveUserRoomData>>;

    constructor() {
        this.activeUserRoomData = new Map<ActiveUser.Id, ActiveUserRoomData>();
        this.roomActiveUsers = new Map<Room.Id, Map<ActiveUser.Id, ActiveUserRoomData>>();

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
