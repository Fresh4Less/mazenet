import * as Api from '../../../common/api';

import { Position, mapToObject, objectToMap } from '../common';
import { ActiveUser } from '../user/models';

export class CursorRecording {
    id: CursorRecording.Id;
    activeUserId: ActiveUser.Id;
    frames: CursorRecordingFrame[];

    constructor(v1: Api.v1.Models.CursorRecording) {
        Object.assign(this, v1);
    }

    toV1(): Api.v1.Models.CursorRecording {
        return {
            id: this.id,
            activeUserId: this.activeUserId,
            frames: this.frames
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
