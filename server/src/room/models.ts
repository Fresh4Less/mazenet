import * as Api from '../../../common/api';

import { Position, mapToObject, objectToMap } from '../common';
import { User, ActiveUser } from '../user/models';

/** Room and structures that can be serialized into an API room. */
export class RoomDocument {
    room: Room;
    structures: Map<Structure.Id, Structure>;
    constructor(room: Room, structures: Map<Structure.Id, Structure>) {
        this.room = room;
        this.structures = structures;
    }

    toV1(): Api.v1.Models.Room {
        return {
            id: this.room.id,
            creator: this.room.creator,
            title: this.room.title,
            owners: Array.from(this.room.owners),
            structures: mapToObject(this.structures, (s:Structure) => s.toV1()),
            stylesheet: this.room.stylesheet
        };
    }
}

export interface RoomOptions {
    id: Room.Id;
    creator: User.Id;
    title: string;
    owners: Set<User.Id>;
    stylesheet: string;
}

/** Room. has no structure data */
export class Room {
    id: Room.Id;
    creator: User.Id;
    title: string;
    owners: Set<User.Id>;
    stylesheet: string;

    constructor(options: RoomOptions) {
        this.id = options.id;
        this.creator = options.creator;
        this.title = options.title;
        this.owners = options.owners;
        this.stylesheet = options.stylesheet;
    }
}

export namespace Room {
    export type Id = string;
    export interface Blueprint {
        title: string;
    }
}

export type StructureData = StructureData.Tunnel | StructureData.Text;

export namespace StructureData {
    export class Tunnel {
        readonly sType = 'tunnel';
        sourceId: Room.Id;
        targetId: Room.Id;
        sourceText: string;
        targetText: string;

        constructor(v1: Api.v1.Models.StructureData.Tunnel) {
            Object.assign(this, v1);
        }

        toV1(): Api.v1.Models.StructureData.Tunnel {
            return {
                sType: this.sType,
                sourceId: this.sourceId,
                targetId: this.targetId,
                sourceText: this.sourceText,
                targetText: this.targetText
            };
        }
    }

    export class Text {
        readonly sType = 'text';
        text: string;
        size: Position;

        constructor(v1: Api.v1.Models.StructureData.Text) {
            Object.assign(this, v1);
        }

        toV1(): Api.v1.Models.StructureData.Text {
            return {
                sType: this.sType,
                text: this.text,
                size: this.size
            };
        }
    }
}


export class Structure {
    id: Structure.Id;
    creator: User.Id;
    pos: Position;
    data: StructureData;

    constructor(v1: Api.v1.Models.Structure) {
        Object.assign(this, v1);
        //this.id = v1.id;
        //this.creator = v1.creator;
        //this.pos = v1.pos;
        //this.data = v1.data;
    }

    toV1(): Api.v1.Models.Structure {
        return {
            id: this.id,
            creator: this.creator,
            pos: this.pos,
            data: this.data.toV1()
        };
    }
}

export namespace Structure {
    export type Id = string;
}

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

export interface ActiveUserRoomData {
    activeUser: ActiveUser;
    roomId: Room.Id;
    /** ISO timestamp representing when the user entered the room */
    enterTime: string;
}

export type RoomEvent = EnterRoomEvent | ExitRoomEvent | StructureCreateEvent ;

export interface EnterRoomEvent {
    event: 'enter';
    roomId: Room.Id;
    activeUser: ActiveUser;
}

export interface ExitRoomEvent {
    event: 'exit';
    roomId: Room.Id;
    activeUser: ActiveUser;
}

export interface StructureCreateEvent {
    event: 'structure-create';
    roomId: Room.Id;
    user: User;
    structure: Structure;
}

