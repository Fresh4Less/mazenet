import { Observable } from 'rxjs/Observable';

import { NotFoundError } from '../../common';
import { CursorRecording, CursorRecordingFrame } from '../models';

import { Room } from '../../room/models';
import { ActiveUser } from '../../user/models';

import { InMemoryDataStore } from './in-memory';
import { PostgresDataStore } from './postgres';

interface DataStore {
    getCursorRecordings: (roomId: Room.Id, limit: number) => Observable<Map<CursorRecording.Id, CursorRecording>>;
    insertCursorRecording: (roomId: Room.Id, cursorRecording: CursorRecording) => Observable<CursorRecording>;
}

interface LiveCursorRecordingDataStore {
    startCursorRecording: (activeUserId: ActiveUser.Id, roomId: Room.Id) => Observable<null>;
    endCursorRecording: (activeUserId: ActiveUser.Id) => Observable<[Room.Id, CursorRecordingFrame[]]>;
    addCursorRecordingFrame: (activeUserId: ActiveUser.Id, frame: CursorRecordingFrame) => Observable<null>;
}

interface LiveCursorRecording {
    roomId: Room.Id;
    frames: CursorRecordingFrame[];
}

class InMemoryLiveCursorRecordingDataStore implements LiveCursorRecordingDataStore {
    public liveCursorRecordings: Map<ActiveUser.Id, LiveCursorRecording>;

    constructor() {
        this.liveCursorRecordings = new Map<ActiveUser.Id, LiveCursorRecording>();
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

export {
    DataStore,
    InMemoryDataStore,
    PostgresDataStore,
    LiveCursorRecordingDataStore,
    InMemoryLiveCursorRecordingDataStore,
};
