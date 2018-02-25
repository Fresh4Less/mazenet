import 'rxjs/add/observable/of';
import { Observable } from 'rxjs/Observable';

import { CursorRecording, CursorRecordingFrame } from './models';

import { AlreadyExistsError, NotFoundError } from '../common';
import { Room } from '../room/models';
import { ActiveUser } from '../user/models';

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
    public cursorRecordings: Map<Room.Id, CursorRecording[]>;
    public liveCursorRecordings: Map<ActiveUser.Id, LiveCursorRecording>;

    constructor() {
        this.cursorRecordings = new Map<Room.Id, CursorRecording[]>();
        this.liveCursorRecordings = new Map<ActiveUser.Id, LiveCursorRecording>();
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

    public startCursorRecording(activeUserId: ActiveUser.Id, roomId: Room.Id) {
        this.liveCursorRecordings.set(activeUserId, {
            frames: [],
            roomId,
        });

        return Observable.of(null);
    }
    public endCursorRecording(activeUserId: ActiveUser.Id) {
        const liveCursorRecording = this.liveCursorRecordings.get(activeUserId);
        if(!liveCursorRecording) {
            throw new NotFoundError(`Active user ${activeUserId} has no cursor recording to end`);
        }

        this.liveCursorRecordings.delete(activeUserId);
        return Observable.of([
            liveCursorRecording.roomId,
            liveCursorRecording.frames
        ]) as Observable<[Room.Id, CursorRecordingFrame[]]>;
    }

    public addCursorRecordingFrame(activeUserId: ActiveUser.Id, frame: CursorRecordingFrame) {
        const liveCursorRecording = this.liveCursorRecordings.get(activeUserId);
        // add the frame ifa recording has started for this active user
        if(liveCursorRecording) {
            liveCursorRecording.frames.push(frame);
        }

        return Observable.of(null);
    }
}
