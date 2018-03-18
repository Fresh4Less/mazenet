import { Pool, QueryResult } from 'pg';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/observable/of';

import * as Uuid from 'uuid/v4';

import { CursorRecording, CursorRecordingFrame } from '../models';

import { AlreadyExistsError, NotFoundError } from '../../common';
import { Room } from '../../room/models';
import { ActiveUser } from '../../user/models';
import { executeTransaction, handlePostgresError } from '../../util/postgres';

import { DataStore } from './index';

export class PostgresDataStore implements DataStore {

    public clientPool: Pool;

    constructor(clientPool: Pool) {
        this.clientPool = clientPool;
    }

    public getCursorRecordings(roomId: Room.Id, limit: number) {
        const cursorRecordingsQuery =
            `SELECT *
            FROM cursorrecordings
            WHERE roomid = $1
            ORDER BY created_at DESC
            LIMIT ${limit > 0 ? '$2' : 'ALL'};`;
        const framesQuery =
            `SELECT *
            FROM cursorrecordingframes
            WHERE cursorrecordingid = ANY($1)
            ORDER BY cursorrecordingid, t ASC;`;
        return Observable.fromPromise(this.clientPool.query(
            cursorRecordingsQuery,
            (limit > 0 ? [roomId, limit] : [roomId]),
        )).mergeMap((result: QueryResult) => {
            const recordingIds = result.rows.map((row) => row.cursorrecordingid);
            return Observable.forkJoin(
                Observable.fromPromise(this.clientPool.query(
                    framesQuery,
                    [recordingIds])),
                Observable.of(result));
        }).map(([framesResult, recordingsResult]) => {
            const cursorFrames = framesResult.rows.reduce((frames, row) => {
                let recording = frames.get(row.cursorrecordingid);
                if(!recording) {
                    recording = [];
                }
                // query should have returned frames ordered by t
                recording.push({
                    pos: row.pos,
                    t: row.t,
                });
                frames.set(row.cursorrecordingid, recording);
                return frames;
            }, new Map<CursorRecording.Id, CursorRecordingFrame>());

            return recordingsResult.rows.reduce((recordings, row) => {
                const cursorRecording = new CursorRecording({
                    activeUserId: row.activeuserid,
                    frames: cursorFrames.get(row.cursorrecordingid) || [],
                    id: row.cursorrecordingid,
                });

                recordings.set(cursorRecording.id, cursorRecording);
                return recordings;
            }, new Map<CursorRecording.Id, CursorRecording>());
        }).catch(handlePostgresError<Map<CursorRecording.Id, CursorRecording>>('getCursorRecordings', [cursorRecordingsQuery, framesQuery].join('\n')));
    }

    public insertCursorRecording(roomId: Room.Id, cursorRecording: CursorRecording) {
        const recordingQuery =
            `INSERT INTO cursorrecordings (cursorrecordingid, activeuserid, roomid) VALUES ($1, $2, $3)`;

        const frameQueryParams = cursorRecording.frames.map((frame, index) => {
            const paramIndex = index*2 + 2;
            return `($1, $${paramIndex}, $${paramIndex + 1})`;
        });
        const framesQuery =
            `INSERT INTO cursorrecordingframes (cursorrecordingid, pos, t) VALUES ${frameQueryParams.join(', ')} RETURNING *;`;
        const frameValues = cursorRecording.frames.reduce((flatFrames, frame) => {
            flatFrames.push(`(${frame.pos.x},${frame.pos.y})`);
            flatFrames.push(frame.t);
            return flatFrames;
        }, [] as any[]);

        const queries = [{ query: recordingQuery, params: [cursorRecording.id, cursorRecording.activeUserId, roomId] }];
        if(cursorRecording.frames.length > 0) {
            queries.push({ query: framesQuery, params: [cursorRecording.id, ...frameValues] });
        }
        return executeTransaction(this.clientPool, queries
        ).map((results: QueryResult[]) => {
            // TODO: return DB results
            return cursorRecording;
        }).catch((err: Error) => {
            // TODO: actual error handling
            if(err.message === 'already exists') {
                return Observable.throw(new AlreadyExistsError(`Cursor recording with id '${cursorRecording.id}' already exists`)) as Observable<CursorRecording>;
            }
            return Observable.throw(err) as Observable<CursorRecording>;
        }).catch(handlePostgresError<CursorRecording>('insertCursorRecording', [recordingQuery, framesQuery].join('\n')));
    }
}
