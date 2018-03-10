import { Client, QueryResult } from 'pg';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/catch';

import { AlreadyExistsError, NotFoundError } from '../../common';
import { handlePostgresError } from '../../util/postgres';

import { ActiveUser } from '../../user/models';
import { ActiveUserRoomData, Room, RoomDocument, RoomOptions, Structure, StructureData } from '../models';

import { DataStore } from './index';

export class PostgresDataStore implements DataStore {

    public client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    public getRootRoomId() {
        const query =
            `SELECT * from rootroom;`;

        return Observable.fromPromise(this.client.query(query)
        ).map((result: QueryResult) => {
            if(result.rows.length === 0) {
                throw new NotFoundError(`Root room id not set`);
            }
            return result.rows[0].rootroomid;
        }).catch(handlePostgresError<Room>('getRootRoomId', query));
    }

    public setRootRoomId(roomId: Room.Id) {
        const query =
            `INSERT INTO rootroom (rowid, rootroomid) VALUES (TRUE, $1)
            ON CONFLICT (rowid) DO UPDATE SET rootroomid = EXCLUDED.rootroomid;`;

        return Observable.fromPromise(this.client.query(
            query,
            [roomId]
        )).map((result: QueryResult) => {
            return null;
        }).catch(handlePostgresError<null>('setRootroomId', query));
    }

    public insertRoom(room: Room) {
        // TODO: throw error if room has no owners, or fix query (don't insert into rooms_owners)
        let ownerParamIndex = 5;
        const ownerQueryParams = [];
        for(const [ownerId, owner] of room.owners) {
            ownerQueryParams.push(`($1, $${ownerParamIndex})`);
            ownerParamIndex++;
        }
        const query =
            `BEGIN;
            INSERT INTO rooms (roomid, creator, title, stylesheet) VALUES ($1, $2, $3, $4) RETURNING *;
            INSERT INTO rooms_owners (roomid, userid) VALUES ${ownerQueryParams.join(', ')};
            END;`;

        return Observable.fromPromise(this.client.query(
            query,
            [room.id, room.creator, room.title, room.stylesheet, ...room.owners]
        )).map((result: QueryResult) => {
            return new Room({
                creator: result.rows[0].creator,
                id: result.rows[0].roomid,
                owners: room.owners,
                stylesheet: result.rows[0].stylesheet,
                title: result.rows[0].title,
            });
        }).catch((err: Error) => {
            // TODO: match to actual error message
            if(err.message === 'already exists') {
                return Observable.throw(new AlreadyExistsError(`Room with id '${room.id}' already exists`)) as Observable<Room>;
            }
            return Observable.throw(err) as Observable<Room>;
        }).catch(handlePostgresError<Room>('insertRoom', query));
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
        return this.getRoomDocuments([roomId]).map((roomDocuments) => {
            if(roomDocuments.length === 0) {
                throw new NotFoundError(`Room '${roomId}' not found`);
            }
            return roomDocuments[0];
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

    protected getRoomDocuments(roomIds: Room.Id[]): Observable<RoomDocument[]> {
        const roomsQuery =
            `SELECT * from rooms WHERE roomid = ANY($1::uuid[]);`;

        const structuresQuery =
        `SELECT * from structures
        JOIN structure_tunnels USING structureid
        WHERE structure_tunnels.sourceId = ANY($1::uuid[]) OR structure_tunnels.targetId = ANY($1::uuid[]);`;
        return Observable.forkJoin(
            Observable.fromPromise(this.client.query(
                roomsQuery,
                [roomIds]
            )),
            Observable.fromPromise(this.client.query(
                structuresQuery,
                [roomIds]
            ))
        ).map(([roomsResult, structuresResult]) => {
            // initialize structures and group them by room
            const roomStructures: Map<Room.Id, Structure[]> = structuresResult.rows.reduce((out: Map<Room.Id, Structure>, structure: any) => {
                let structureData: StructureData;
                let parentRooms: Room.Id[] = [];
                switch(structure.stype) {
                    case 'tunnel':
                        structureData = new StructureData({
                            sType: structure.stype,
                            sourceId: structure.sourceid,
                            sourceText: structure.sourcetext,
                            targetId: structure.targetid,
                            targetText: structure.targettext,
                        });
                        parentRooms = [structureData.sourceId, structureData.targetId];
                        break;
                    default:
                        throw new Error(`Unrecognized stype ${structure.stype}`);
                }
                parentRooms.forEach((roomId: Room.Id) => {
                    const structures = out.get(roomId) || [];
                    structures.push(structure);
                    out.set(roomId, structures);
                });
                return out;
            }, new Map<Room.Id, Structure[]>());

            // create rooms
            return roomsResult.rows.map((roomRow: any) => {
                const room = new Room({
                    creator: roomRow.creator,
                    id: roomRow.roomid,
                    stylesheet: roomRow.stylesheet,
                    title: roomRow.title,
                });
                const structures = new Map<Structure.Id, Structure>(
                    (roomStructures.get(room.id) || []).map((s: Structure) => [s.id, s])
                );
                return new RoomDocument(room, structures);
            });
        });
    }
}
