import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/catch';

import * as Uuid from 'uuid/v4';

import * as Api from '../../../common/api';

import { GlobalLogger } from '../util/logger';
import { NotFoundError } from '../common';
import { DataStore } from './datastore';
import { CursorRecording, CursorRecordingFrame, CursorEvent } from './models';

import { Room, ActiveUserRoomData } from '../room/models';
import { User, ActiveUser } from '../user/models';
import { Position } from '../common';

export class Service {
    dataStore: DataStore;

    events: Observable<CursorEvent>;

    private eventObserver: Observer<CursorEvent>;

    constructor(dataStore: DataStore) {
        this.dataStore = dataStore;

        this.events = Observable.create((observer: Observer<CursorEvent>) => {
            this.eventObserver = observer;
        }).share();
    }

    getCursorRecordings(roomId: Room.Id, limit: number): Observable<Map<CursorRecording.Id, CursorRecording>> {
        return this.dataStore.getCursorRecordings(roomId, limit);
    }

    startCursorRecording(activeUserId: ActiveUser.Id, roomId: Room.Id): Observable<null> {
        return this.dataStore.startCursorRecording(activeUserId, roomId);
    }

    /* Commit the user's cursor frames to the room */
    endCursorRecording(activeUserId: ActiveUser.Id): Observable<CursorRecording> {
        return this.dataStore.endCursorRecording(activeUserId)
        .mergeMap(([roomId, frames]: [Room.Id, CursorRecordingFrame[]]) => {
            let cursorRecording = new CursorRecording({
                id: Uuid(),
                activeUserId: activeUserId,
                frames: frames
            });
            return this.dataStore.insertCursorRecording(roomId, cursorRecording);
        }).map((cursorRecording) => {
            GlobalLogger.trace('cursor recording', {id: cursorRecording.id, activeUserId: cursorRecording.activeUserId});
            return cursorRecording;
        });
    }

    /** Record a frame of cursor movement.
     * The frame's `t` property is the number of 1/30 second intervals have passed since the active user entered the room, based on the current time.
     */
    onCursorMoved(activeUserRoomData: ActiveUserRoomData, pos: Position): Observable<null> {
        let frame = {
            pos: pos,
            t: Math.floor((new Date().valueOf() - new Date(activeUserRoomData.enterTime).valueOf())/30)
        };
        return this.dataStore.addCursorRecordingFrame(activeUserRoomData.activeUser.id, frame).map(() => {;
            this.eventObserver.next({
                event: 'move',
                roomId: activeUserRoomData.roomId,
                activeUser: activeUserRoomData.activeUser,
                pos: pos
            });
            return null;
        });
    }
}
