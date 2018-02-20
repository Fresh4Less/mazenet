import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

import { CursorRecording, CursorRecordingFrame } from './models';

import { Room } from '../room/models';
import {ActiveUser} from '../user/models';
import { NotFoundError, AlreadyExistsError } from '../common';

import * as Uuid from 'uuid/v4';

export interface DataStore {
    getCursorRecordings: (roomId: Room.Id, limit: number) => Observable<Map<CursorRecording.Id, CursorRecording>>;
    insertCursorRecording: (roomId: Room.Id, cursorRecording: CursorRecording) => Observable<CursorRecording>;

    startCursorRecording: (activeUserId: ActiveUser.Id, roomId: Room.Id) => Observable<null>;
    endCursorRecording: (activeUserId: ActiveUser.Id) => Observable<[Room.Id, CursorRecordingFrame[]]>;
    addCursorRecordingFrame: (activeUserId: ActiveUser.Id, frame: CursorRecordingFrame) => Observable<null>;
}

interface LiveCursorRecording {
    roomId: Room.Id;
    frames: CursorRecordingFrame[];
}

export class InMemoryDataStore implements DataStore {
    /** committed cursor recordings in room, ordered by creation time asc (newest last) */
    cursorRecordings: Map<Room.Id, CursorRecording[]>;
    liveCursorRecordings: Map<ActiveUser.Id, LiveCursorRecording>;

    constructor() {
        this.cursorRecordings = new Map<Room.Id, CursorRecording[]>();
        this.liveCursorRecordings = new Map<ActiveUser.Id, LiveCursorRecording>();
    }

    getCursorRecordings(roomId: Room.Id, limit: number) {
        let cursorRecordings = this.cursorRecordings.get(roomId);
        if(!cursorRecordings) {
            cursorRecordings = [];
        }

        let recordingMap = cursorRecordings.slice(-limit).reduce((m, cursorRecording) => {
            m.set(cursorRecording.id, cursorRecording);
            return m;
        }, new Map<CursorRecording.Id, CursorRecording>());

        return Observable.of(recordingMap);
    }

    insertCursorRecording(roomId: Room.Id, cursorRecording: CursorRecording) {
        if(!this.cursorRecordings.has(roomId)) {
            this.cursorRecordings.set(roomId, []);
        }

        let cursorRecordings = this.cursorRecordings.get(roomId);

        cursorRecordings!.push(cursorRecording);
        return Observable.of(cursorRecording);
    }

    startCursorRecording(activeUserId: ActiveUser.Id, roomId: Room.Id) {
        this.liveCursorRecordings.set(activeUserId, {
            roomId: roomId,
            frames: []
        });

        return Observable.of(null);
    }
    endCursorRecording(activeUserId: ActiveUser.Id) {
        let liveCursorRecording = this.liveCursorRecordings.get(activeUserId);
        if(!liveCursorRecording) {
            throw new NotFoundError(`Active user ${activeUserId} has no cursor recording to end`);
        }

        this.liveCursorRecordings.delete(activeUserId);
        return <Observable<[Room.Id, CursorRecordingFrame[]]>>Observable.of([liveCursorRecording.roomId, liveCursorRecording.frames]);
    }

    addCursorRecordingFrame(activeUserId: ActiveUser.Id, frame: CursorRecordingFrame) {
        let liveCursorRecording = this.liveCursorRecordings.get(activeUserId);
        // add the frame if a recording has started for this active user
        if(liveCursorRecording) {
            liveCursorRecording.frames.push(frame);
        }

        return Observable.of(null);
    }
}
