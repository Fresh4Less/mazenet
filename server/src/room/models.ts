import * as Api from '../../../common/api';
import { SafeStylesheet } from '../../../common/util/stylesheet';

import { mapToObject, objectToMap, Position } from '../common';
import { ActiveUser, User } from '../user/models';

/** Room and structures that can be serialized into an API room. */
export class RoomDocument {
    public room: Room;
    public structures: Map<Structure.Id, Structure>;
    constructor(room: Room, structures: Map<Structure.Id, Structure>) {
        this.room = room;
        this.structures = structures;
    }

    public toV1(): Api.v1.Models.Room {
        return {
            creator: this.room.creator,
            id: this.room.id,
            owners: Array.from(this.room.owners),
            structures: mapToObject(this.structures, (s: Structure) => s.toV1()),
            stylesheet: this.room.stylesheet,
            title: this.room.title,
        };
    }
}

export interface RoomOptions {
    id: Room.Id;
    creator: User.Id;
    title: string;
    owners: Set<User.Id>;
    stylesheet: SafeStylesheet;
}

/** Room. has no structure data */
export class Room {
    public id: Room.Id;
    public creator: User.Id;
    public title: string;
    public owners: Set<User.Id>;
    public stylesheet: SafeStylesheet;

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
        stylesheet: Api.v1.Models.Stylesheet;
    }
}

export type StructureData = StructureData.Tunnel | StructureData.Text;

export namespace StructureData {
    export class Tunnel {
        public readonly sType = 'tunnel';
        public sourceId: Room.Id;
        public targetId: Room.Id;
        public sourceText: string;
        public targetText: string;

        constructor(v1: Api.v1.Models.StructureData.Tunnel) {
            Object.assign(this, v1);
        }

        public toV1(): Api.v1.Models.StructureData.Tunnel {
            return {
                sType: this.sType,
                sourceId: this.sourceId,
                sourceText: this.sourceText,
                targetId: this.targetId,
                targetText: this.targetText,
            };
        }
    }

    export class Text {
        public readonly sType = 'text';
        public roomId: Room.Id;
        public text: string;
        public width: number;

        constructor(v1: Api.v1.Models.StructureData.Text) {
            Object.assign(this, v1);
        }

        public toV1(): Api.v1.Models.StructureData.Text {
            return {
                sType: this.sType,

                roomId: this.roomId,
                text: this.text,
                width: this.width,
            };
        }
    }
}

export class Structure {
    public id: Structure.Id;
    public creator: User.Id;
    public pos: Position;
    public data: StructureData;

    constructor(v1: Api.v1.Models.Structure) {
        Object.assign(this, v1);
        //this.id = v1.id;
        //this.creator = v1.creator;
        //this.pos = v1.pos;
        //this.data = v1.data;
    }

    public toV1(): Api.v1.Models.Structure {
        return {
            creator: this.creator,
            data: this.data.toV1(),
            id: this.id,
            pos: this.pos,
        };
    }
}

export namespace Structure {
    export type Id = string;
}

export function getStructureRoomIds(structure: Structure): Room.Id[] {
    switch(structure.data.sType) {
        case 'tunnel':
            return [structure.data.sourceId, structure.data.targetId];
        case 'text':
            return [structure.data.roomId];
        default:
            return [];
    }
}

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

export interface ActiveUserRoomData {
    activeUser: ActiveUser;
    roomId: Room.Id;
    /** ISO timestamp representing when the user entered the room */
    enterTime: string;
}

export type RoomEvent = EnteredRoomEvent | ExitedRoomEvent | UpdatedEvent | StructureCreatedEvent | StructureUpdatedEvent;

export interface EnteredRoomEvent {
    event: 'enter';
    roomId: Room.Id;
    activeUser: ActiveUser;
}

export interface ExitedRoomEvent {
    event: 'exit';
    roomId: Room.Id;
    activeUser: ActiveUser;
}

export interface UpdatedEvent {
    event: 'update';
    room: Room;
    user: User;
}

export interface StructureCreatedEvent {
    event: 'structure-create';
    roomIds: Room.Id[];
    user: User;
    structure: Structure;
}

export interface StructureUpdatedEvent {
    event: 'structure-update';
    roomIds: Room.Id[];
    user: User;
    structure: Structure;
}
