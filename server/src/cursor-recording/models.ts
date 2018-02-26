import * as Api from '../../../common/api';

import { mapToObject, objectToMap, Position } from '../common';
import { Room } from '../room/models';
import { ActiveUser } from '../user/models';

export class CursorRecording {
    public id: CursorRecording.Id;
    public activeUserId: ActiveUser.Id;
    public frames: CursorRecordingFrame[];

    constructor(v1: Api.v1.Models.CursorRecording) {
        Object.assign(this, v1);
    }

    public toV1(): Api.v1.Models.CursorRecording {
        return {
            activeUserId: this.activeUserId,
            frames: this.frames,
            id: this.id,
        };
    }
}

export interface CursorRecordingFrame {
    pos: Position;
    t: number;
}

export namespace CursorRecording {
    export type Id = string;
}

export type CursorEvent = CursorMovedEvent;

export interface CursorMovedEvent {
    event: 'move';
    roomId: Room.Id;
    activeUser: ActiveUser;
    pos: Position;
}
