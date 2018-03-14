import { Pool, PoolClient, QueryResult } from 'pg';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/catch';

import { AlreadyExistsError, NotFoundError } from '../../common';
import { executeTransaction, handlePostgresError } from '../../util/postgres';

import { ActiveUser } from '../../user/models';
import { ActiveUserRoomData, Room, RoomDocument, RoomOptions, Structure, StructureData } from '../models';

import { DataStore } from './index';

export class PostgresDataStore implements DataStore {

    public clientPool: Pool;

    constructor(clientPool: Pool) {
        this.clientPool = clientPool;
    }

    public getRootRoomId() {
        const query =
            `SELECT * from rootroom;`;

        return Observable.fromPromise(this.clientPool.query(query)
        ).map((result: QueryResult) => {
            if(result.rows.length === 0) {
                throw new NotFoundError(`Root room id not set`);
            }
            return result.rows[0].rootroomid;
        }).catch(handlePostgresError<Room.Id>('getRootRoomId', query));
    }

    public setRootRoomId(roomId: Room.Id) {
        const query =
            `INSERT INTO rootroom (rowid, rootroomid) VALUES (TRUE, $1)
            ON CONFLICT (rowid) DO UPDATE SET rootroomid = EXCLUDED.rootroomid;`;

        return Observable.fromPromise(this.clientPool.query(
            query,
            [roomId]
        )).map((result: QueryResult) => {
            return null;
        }).catch(handlePostgresError<null>('setRootUserId', query));
    }

    public insertRoom(room: Room) {
        let ownerParamIndex = 2;
        const ownerQueryParams = [];
        for(const [ownerId, owner] of room.owners) {
            ownerQueryParams.push(`($1, $${ownerParamIndex})`);
            ownerParamIndex++;
        }
        const insertRoomQuery =
            `INSERT INTO rooms (roomid, creator, title, stylesheet) VALUES ($1, $2, $3, $4) RETURNING *;`;
        const insertOwnersQuery =
            `INSERT INTO rooms_owners (roomid, userid) VALUES ${ownerQueryParams.join(', ')} RETURNING *;`;
        // TODO: throw error if room has no owners
        return executeTransaction(this.clientPool, [
            { query: insertRoomQuery, params: [room.id, room.creator, room.title, room.stylesheet] },
            { query: insertOwnersQuery, params: [room.id, ...room.owners] },
        ]).map((results: QueryResult[]) => {
            // TODO: return DB results
            return room;
        }).catch((err: Error) => {
            if(err.message === 'already exists') {
                return Observable.throw(new AlreadyExistsError(`Room with id '${room.id}' already exists`)) as Observable<Room>;
            }
            return Observable.throw(err) as Observable<Room>;
        }).catch(handlePostgresError<Room>('insertRoom', [insertRoomQuery, insertOwnersQuery].join('\n')));
    }

    public insertStructure(structure: Structure) {

        const structureQuery = `INSERT INTO structures (structureid, stype, creator, pos) VALUES ($1, $2, $3, $4)`;
        let structureTypeQuery = '';
        let structureTypeArgs: any[] = [];
        switch(structure.data.sType) {
            case 'tunnel':
                structureTypeQuery = `INSERT INTO structure_tunnels (structureid, sourceid, sourcetext, targetid, targettext) VALUES ($1, $2, $3, $4, $5);`;
                structureTypeArgs = [structure.data.sourceId, structure.data.sourceText, structure.data.targetId, structure.data.targetText];
                break;
            default:
                // TODO: throw error
        }
        return executeTransaction(this.clientPool, [
            { query: structureQuery, params: [structure.id, structure.data.sType, structure.creator, `(${structure.pos.x},${structure.pos.y})`] },
            { query: structureTypeQuery, params: [structure.id, ...structureTypeArgs] },
        ]).map((results: QueryResult[]) => {
            // TODO: return db results
            return structure;
        }).catch((err: Error) => {
            // TODO: match to actual error message
            if(err.message === 'already exists') {
                return Observable.throw(new AlreadyExistsError(`Structure with id '${structure.id}' already exists`)) as Observable<Structure>;
            }
            return Observable.throw(err) as Observable<Structure>;
        }).catch(handlePostgresError<Structure>('insertStructure', [structureQuery, structureTypeQuery].join('\n')));
    }

    public getRoomDocument(roomId: Room.Id) {
        return this.getRoomDocuments([roomId]).map((roomDocuments) => {
            if(roomDocuments.length === 0) {
                throw new NotFoundError(`Room '${roomId}' not found`);
            }
            return roomDocuments[0];
        });
    }

    protected getRoomDocuments(roomIds: Room.Id[]): Observable<RoomDocument[]> {
        const roomsQuery =
        `SELECT rooms.*, array_agg(rooms_owners.userid) as owners
        FROM rooms 
        LEFT JOIN rooms_owners USING (roomid)
        WHERE roomid = ANY($1)
        GROUP BY rooms.roomid;`;

        const structuresQuery =
        `SELECT *
        FROM structures
        JOIN structure_tunnels USING (structureid)
        WHERE structure_tunnels.sourceId = ANY($1) OR structure_tunnels.targetId = ANY($1);`;
        return Observable.forkJoin(
            Observable.fromPromise(this.clientPool.query(
                roomsQuery,
                [roomIds]
            )),
            Observable.fromPromise(this.clientPool.query(
                structuresQuery,
                [roomIds]
            ))
        ).map(([roomsResult, structuresResult]) => {
            // initialize structures and group them by room
            const roomStructures: Map<Room.Id, Structure[]> = structuresResult.rows.reduce((out: Map<Room.Id, Structure[]>, structureRow: any) => {
                let structureData: StructureData;
                let parentRooms: Room.Id[] = [];
                switch(structureRow.stype) {
                    case 'tunnel':
                        structureData = new StructureData.Tunnel({
                            sType: structureRow.stype,
                            sourceId: structureRow.sourceid,
                            sourceText: structureRow.sourcetext,
                            targetId: structureRow.targetid,
                            targetText: structureRow.targettext,
                        });
                        parentRooms = [structureData.sourceId, structureData.targetId];
                        break;
                    default:
                        throw new Error(`Unrecognized stype ${structureRow.stype}`);
                }
                const structure = new Structure({
                    creator: structureRow.creator,
                    data: structureData,
                    id: structureRow.structureid,
                    pos: structureRow.pos,
                });
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
                    owners: roomRow.owners,
                    stylesheet: roomRow.stylesheet,
                    title: roomRow.title,
                });
                const structures = new Map<Structure.Id, Structure>(
                    (roomStructures.get(room.id) || []).map((s: Structure) => [s.id, s] as [Structure.Id, Structure])
                );
                return new RoomDocument(room, structures);
            });
        }).catch(handlePostgresError<RoomDocument[]>('getRoomDocuments', [roomsQuery, structuresQuery].join('\n')));
    }
}
