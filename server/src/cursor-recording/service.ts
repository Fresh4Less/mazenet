import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import * as Uuid from 'uuid/v4';

import * as Api from '../../../common/api';

import { NotFoundError } from '../common';
import { GlobalLogger } from '../util/logger';
import { DataStore } from './datastore';
import { CursorEvent, CursorRecording, CursorRecordingFrame } from './models';

import { Position } from '../common';
import { ActiveUserRoomData, Room } from '../room/models';
import { ActiveUser, User } from '../user/models';

export class Service {
    public dataStore: DataStore;

    public events: Observable<CursorEvent>;

    private eventObserver: Observer<CursorEvent>;

    constructor(dataStore: DataStore) {
        this.dataStore = dataStore;

        this.events = Observable.create((observer: Observer<CursorEvent>) => {
            this.eventObserver = observer;
        }).share();
    }

    public getCursorRecordings(roomId: Room.Id, limit: number): Observable<Map<CursorRecording.Id, CursorRecording>> {
        return this.dataStore.getCursorRecordings(roomId, limit);
    }

    public startCursorRecording(activeUserId: ActiveUser.Id, roomId: Room.Id): Observable<null> {
        return this.dataStore.startCursorRecording(activeUserId, roomId);
    }

    /* Commit the user's cursor frames to the room */
    public endCursorRecording(activeUserId: ActiveUser.Id): Observable<CursorRecording> {
        return this.dataStore.endCursorRecording(activeUserId)
        .mergeMap(([roomId, frames]: [Room.Id, CursorRecordingFrame[]]) => {
            const cursorRecording = new CursorRecording({
                activeUserId,
                frames,
                id: Uuid(),
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
    public onCursorMoved(activeUserRoomData: ActiveUserRoomData, pos: Position): Observable<null> {
        const frame = {
            pos,
            t: Math.floor((new Date().valueOf() - new Date(activeUserRoomData.enterTime).valueOf()) / 30)
        };
        return this.dataStore.addCursorRecordingFrame(activeUserRoomData.activeUser.id, frame).map(() => {
            this.eventObserver.next({
                activeUser: activeUserRoomData.activeUser,
                event: 'move',
                pos,
                roomId: activeUserRoomData.roomId,
            });
            return null;
        });
    }
}
