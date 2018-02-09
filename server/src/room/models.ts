import * as Api from '../../../common/api';

import { Position } from '../common';
import { User } from '../user/models';

export class Room {
    id: Room.Id;
    creator: User.Id;
    title: string;
    owners: Set<User.Id>;
    //TODO: remove this from Room, create a new "Room document" class which contains both a room and structures (reflects shape of data in db)
    structures: Map<Structure.Id, Structure>;
    stylesheet: string;

    constructor(v1: Api.v1.Models.Room) {
        this.id = v1.id;
        this.creator = v1.creator;
        this.title = v1.title;
        this.owners = new Set<User.Id>(v1.owners);
        this.structures = Object.keys(v1.structures).reduce((map: Map<Structure.Id, Structure>, sId: Structure.Id) => {
            map.set(sId, new Structure(v1.structures[sId]));
            return map;
        }, new Map<Structure.Id, Structure>());
        this.stylesheet = v1.stylesheet;
    }

    toV1(): Api.v1.Models.Room {
        return {
            id: this.id,
            creator: this.creator,
            title: this.title,
            owners: Array.from(this.owners),
            structures: (() => {
                let o: {[structureId: string]: Api.v1.Models.Structure} = {};
                for(let [sId, s] of this.structures) {
                    o[sId] = s.toV1();
                }
                return o;
            })(),
            stylesheet: this.stylesheet
        };
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


