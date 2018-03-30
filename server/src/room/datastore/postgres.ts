import { Pool, PoolClient, QueryResult } from 'pg';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/catch';

import { AlreadyExistsError, NotFoundError, Position } from '../../common';
import { buildQuery_SetColumns, executeTransaction, handlePostgresError, QueryData } from '../../util/postgres';

import { ActiveUser } from '../../user/models';
import { ActiveUserRoomData, Room, RoomDocument, RoomOptions, Structure, StructureData } from '../models';

import { DataStore } from './index';

// Structure constructor only takes api.v1
// Structure patch only defined in API
import * as Api from '../../../../common/api';

function posToPoint(pos?: Position): string | undefined {
    if(!pos) {
        return pos;
    }
    return `(${pos.x},${pos.y})`;
}

function structureFromRow(row: any): Structure {
    let structureData: StructureData;
    switch(row.stype) {
        case 'tunnel':
            structureData = new StructureData.Tunnel({
                sType: row.stype,
                sourceId: row.sourceid,
                sourceText: row.sourcetext,
                targetId: row.targetid,
                targetText: row.targettext,
            });
            break;
        default:
            throw new Error(`Unrecognized stype ${row.stype}`);
    }

    return new Structure({
        creator: row.creator,
        data: structureData,
        id: row.structureid,
        pos: row.pos,
    });
}

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
        ]).map((results: Array<QueryResult | undefined>) => {
            // TODO: return DB results
            return room;
        }).catch((err: Error) => {
            if(err.message === 'already exists') {
                return Observable.throw(new AlreadyExistsError(`Room already exists: '${room.id}'`)) as Observable<Room>;
            }
            return Observable.throw(err) as Observable<Room>;
        }).catch(handlePostgresError<Room>('insertRoom', [insertRoomQuery, insertOwnersQuery].join('\n')));
    }

    public getStructure(id: Structure.Id) {
        const query =
            `SELECT *
            FROM structures
            JOIN structure_tunnels USING (structureid)
            WHERE structures.structureid=$1`;

        return Observable.fromPromise(this.clientPool.query(query, [id])
        ).map((result: QueryResult) => {
            if(result.rows.length === 0) {
                throw new NotFoundError(`Structure not found: '${id}'`);
            }
            return structureFromRow(result.rows[0]);
        }).catch(handlePostgresError<Structure>('getStructure', query));
    }

    // shouldn't use api here
    public updateStructure(id: Structure.Id, patch: Api.v1.Models.Structure.Patch) {
        // record queries for error logging
        const queries: string[] = [];

        const structureSetColumnsData = buildQuery_SetColumns([
            ['pos', posToPoint(patch.pos)],
        ], 2);

        const structureQuery =
            `UPDATE structures
            ${structureSetColumnsData.query}
            WHERE structureid=$1
            RETURNING *;`;
        queries.push(structureQuery);
        return executeTransaction(this.clientPool, [
            // update structure
            {query: structureQuery, params: [id, ...structureSetColumnsData.params]},
            // update structure data table based on stype
            (result: QueryResult) => {
                const row = result.rows[0];
                switch(row.stype) {
                    case 'tunnel':
                        const patchData = patch.data as Api.v1.Models.StructureData.Tunnel.Patch;
                        const setColumnsData = buildQuery_SetColumns([
                            ['sourcetext', patchData.sourceText],
                            ['targettext', patchData.targetText],
                        ], 2);

                        const structureDataQuery =
                            `UPDATE structure_tunnels
                            ${setColumnsData.query}
                            WHERE structureid=$1
                            RETURNING *;`;
                        queries.push(structureDataQuery); 

                        return {
                            params: [id, ...setColumnsData.params],
                            query: structureDataQuery,
                        };
                default:
                    throw new Error(`Unrecognized stype ${row.stype}`);
                }
            },
        ]).map((results: Array<QueryResult | undefined>) => {
            const combinedRows = Object.assign({}, results[0]!.rows[0], results[1]!.rows[0]);
            return structureFromRow(combinedRows);

        }).catch(handlePostgresError<Structure>('updateStructure', queries.join('\n')));
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
            { query: structureQuery, params: [structure.id, structure.data.sType, structure.creator, posToPoint(structure.pos)] },
            { query: structureTypeQuery, params: [structure.id, ...structureTypeArgs] },
        ]).map((results: Array<QueryResult | undefined>) => {
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
                let parentRooms: Room.Id[] = [];
                const structure = structureFromRow(structureRow);
                if(structure.data.sType === 'tunnel') {
                    parentRooms = [structure.data.sourceId, structure.data.targetId];
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
