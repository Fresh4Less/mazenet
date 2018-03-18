import { Observable } from 'rxjs/Observable';

import { ActiveUser } from '../../user/models';
import { ActiveUserRoomData, Room, RoomDocument, Structure } from '../models';

import { InMemoryDataStore } from './in-memory';
import { PostgresDataStore } from './postgres';

import { InMemoryActiveUserRoomDataStore } from './in-memory-active-user-room';

/* persistant room and structure data */
interface DataStore {
    getRootRoomId: () => Observable<string>;
    setRootRoomId: (roomId: Room.Id) => Observable<null>;

    //getRoom: (roomId: Room.Id) => Observable<Room>;
    insertRoom: (room: Room) => Observable<Room>;
    //updateRoom: (updatedRoom: Room) => Observable<Room>;

    //getStructure: (structureId: Structure.Id) => Observable<Structure>;
    insertStructure: (structure: Structure) => Observable<Structure>;

    getRoomDocument: (roomId: Room.Id) => Observable<RoomDocument>;
}

/** active users currently in each room */
interface ActiveUserRoomDataStore {
    getActiveUserRoomData: (activeUserId: ActiveUser.Id) => Observable<ActiveUserRoomData | undefined>;
    insertActiveUserToRoom: (roomId: Room.Id, activeUser: ActiveUserRoomData) => Observable<null>;
    deleteActiveUserFromRoom: (roomId: Room.Id, activeUserId: ActiveUser.Id) => Observable<null>;
    getActiveUsersInRoom: (roomId: Room.Id) => Observable<Map<ActiveUser.Id, ActiveUserRoomData>>;
}
// TODO: make redis pub-sub active user room datastore

export {
    DataStore,
    InMemoryDataStore,
    PostgresDataStore,
    ActiveUserRoomDataStore,
    InMemoryActiveUserRoomDataStore,
};
