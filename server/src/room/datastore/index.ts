import { Observable } from 'rxjs/Observable';

import { ActiveUser } from '../../user/models';
import { ActiveUserRoomData, Room, RoomDocument, Structure } from '../models';

import { InMemoryDataStore } from './in-memory';
import { PostgresDataStore } from './postgres';

interface DataStore {
    getRootRoomId: () => Observable<string | undefined>;
    setRootRoomId: (roomId: Room.Id) => Observable<null>;

    //getRoom: (roomId: Room.Id) => Observable<Room>;
    insertRoom: (room: Room) => Observable<Room>;
    //updateRoom: (updatedRoom: Room) => Observable<Room>;

    //getStructure: (structureId: Structure.Id) => Observable<Structure>;
    insertStructure: (structure: Structure) => Observable<Structure>;

    getRoomDocument: (roomId: Room.Id) => Observable<RoomDocument>;

    getActiveUserRoomData: (activeUserId: ActiveUser.Id) => Observable<ActiveUserRoomData | undefined>;
    insertActiveUserToRoom: (roomId: Room.Id, activeUser: ActiveUserRoomData) => Observable<null>;
    deleteActiveUserFromRoom: (roomId: Room.Id, activeUserId: ActiveUser.Id) => Observable<null>;
    getActiveUsersInRoom: (roomId: Room.Id) => Observable<Map<ActiveUser.Id, ActiveUserRoomData>>;
}

export {
    DataStore,
    InMemoryDataStore,
    PostgresDataStore,
};
