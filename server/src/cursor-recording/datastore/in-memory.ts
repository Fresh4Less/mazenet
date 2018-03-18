import 'rxjs/add/observable/of';
import { Observable } from 'rxjs/Observable';

import * as Uuid from 'uuid/v4';

import { CursorRecording, CursorRecordingFrame } from '../models';

import { AlreadyExistsError, NotFoundError } from '../../common';
import { Room } from '../../room/models';
import { ActiveUser } from '../../user/models';

import { DataStore } from './index';

export class InMemoryDataStore implements DataStore {
    /** committed cursor recordings in room, ordered by creation time asc (newest last) */
    public cursorRecordings: Map<Room.Id, CursorRecording[]>;

    constructor() {
        this.cursorRecordings = new Map<Room.Id, CursorRecording[]>();
    }

    public getCursorRecordings(roomId: Room.Id, limit: number) {
        let cursorRecordings = this.cursorRecordings.get(roomId);
        if(!cursorRecordings) {
            cursorRecordings = [];
        }

        const recordingMap = cursorRecordings.slice(-limit).reduce((m, cursorRecording) => {
            m.set(cursorRecording.id, cursorRecording);
            return m;
        }, new Map<CursorRecording.Id, CursorRecording>());

        return Observable.of(recordingMap);
    }

    public insertCursorRecording(roomId: Room.Id, cursorRecording: CursorRecording) {
        if(!this.cursorRecordings.has(roomId)) {
            this.cursorRecordings.set(roomId, []);
        }

        const cursorRecordings = this.cursorRecordings.get(roomId);

        cursorRecordings!.push(cursorRecording);
        return Observable.of(cursorRecording);
    }
}
