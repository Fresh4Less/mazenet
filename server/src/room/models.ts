import * as Api from '../../../common/api';

import { Position } from '../common';
import { User } from '../user/models';

export class Room {
    id: Room.Id;
    creator: User.Id;
    title: string;
    owners: { [userId: string]: User };
    structures: { [structureId: string]: Structure };
    stylesheet: string;

    constructor(v1: Api.v1.Models.Room) {
        this.id = v1.id;
        this.creator = v1.creator;
        this.title = v1.title;
        this.owners = v1.owners;
        this.structures = Object.keys(v1.structures).reduce((o: { [structureId: string]: Structure }, s) => {
            o[s] = new Structure(v1.structures[s]);
            return o;
        }, {});
        this.stylesheet = v1.stylesheet;
    }
}

export namespace Room {
    export type Id = string;
}

export class Structure {
    id: Structure.Id;
    creator: User.Id;
    pos: Position;
    data: Structure.Data;

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
            data: this.data
        };
    }
}

export namespace Structure {
    export type Id = string;
    export type Data = Tunnel;

    export class Tunnel {
        sType: 'tunnel';
        sourceId: Room.Id;
        targetId: Room.Id;
        sourceText: string;
        targetText: string;

        constructor(v1: Api.v1.Models.Structure.Data.Tunnel) {
            Object.assign(this, v1);
        }
    }

}

