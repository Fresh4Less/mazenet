import { of, forkJoin, Observable, Subject } from 'rxjs';
import { map, mergeMap, catchError, share } from 'rxjs/operators';

import * as Uuid from 'uuid/v4';

import * as Api from '../../../common/api';

import { NotFoundError } from '../common';
import { GlobalLogger } from '../util/logger';
import { DataStore, LiveCursorRecordingDataStore } from './datastore';
import { CursorEvent, CursorRecording, CursorRecordingFrame } from './models';

import { Position } from '../common';
import { ActiveUserRoomData, Room } from '../room/models';
import { ActiveUser, User } from '../user/models';
import { Service as UserService } from '../user/service';

export class Service {
    public dataStore: DataStore;
    public liveCursorRecordingDataStore: LiveCursorRecordingDataStore;
    public userService: UserService;

    public events: Observable<CursorEvent>;

    protected eventSubject: Subject<CursorEvent>;

    constructor(dataStore: DataStore, liveCursorRecordingDataStore: LiveCursorRecordingDataStore, userService: UserService) {
        this.dataStore = dataStore;
        this.liveCursorRecordingDataStore = liveCursorRecordingDataStore;
        this.userService = userService;

        this.eventSubject = new Subject();
        this.events = this.eventSubject.pipe(share());
    }

    public getCursorRecordings(roomId: Room.Id, limit: number): Observable<Map<CursorRecording.Id, CursorRecording>> {
        return this.dataStore.getCursorRecordings(roomId, limit);
    }

    public startCursorRecording(activeUserId: ActiveUser.Id, roomId: Room.Id): Observable<null> {
        return this.liveCursorRecordingDataStore.startCursorRecording(activeUserId, roomId);
    }

    /* Commit the user's cursor frames to the room */
    public endCursorRecording(activeUserId: ActiveUser.Id): Observable<CursorRecording> {
        return this.liveCursorRecordingDataStore.endCursorRecording(activeUserId).pipe(
            mergeMap(([roomId, frames]: [Room.Id, CursorRecordingFrame[]]) => {
                const cursorRecording = new CursorRecording({
                    activeUserId,
                    frames,
                    id: Uuid(),
                });
                return forkJoin(
                    this.dataStore.insertCursorRecording(roomId, cursorRecording),
                    of(roomId));
            }),
            map(([cursorRecording, roomId]) => {
                GlobalLogger.trace('create cursor recording', {id: cursorRecording.id, activeUserId: cursorRecording.activeUserId, roomId});
                return cursorRecording;
            })
        );
    }

    /** Record a frame of cursor movement.
     * The frame's `t` property is the number of 1/30 second intervals have passed since the active user entered the room, based on the current time.
     */
    public onCursorMoved(activeUserRoomData: ActiveUserRoomData, pos: Position): Observable<null> {
        // NOTE: activeUserRoomData might not be stored in memory in the future, and this update will break
        (activeUserRoomData.activeUser.platformData as ActiveUser.PlatformData.Desktop).cursorPos = pos;
        const frame = {
            pos,
            t: Math.floor((new Date().valueOf() - new Date(activeUserRoomData.enterTime).valueOf()) / 30)
        };
        return this.liveCursorRecordingDataStore.addCursorRecordingFrame(activeUserRoomData.activeUser.id, frame).pipe(
            map(() => {
                this.eventSubject.next({
                    activeUser: activeUserRoomData.activeUser,
                    event: 'move',
                    pos,
                    roomId: activeUserRoomData.roomId,
                });
                return null;
            })
        );
    }
}
