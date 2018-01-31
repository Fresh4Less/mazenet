import * as Api from '../../../common/api';
import { Position } from '../common';

export class User {
    id: User.Id;
    username: string;

    constructor(v1: Api.v1.Models.User) {
        this.id = v1.id;
        this.username = v1.username;
    }
}

export namespace User {
    export type Id = string;
}

export class ActiveUser {
    id: ActiveUser.Id;
    userId: User.Id;
    username: string;
    platformData: ActiveUser.PlatformData;

    constructor(v1: Api.v1.Models.ActiveUser) {
        Object.assign(this, v1);
    }

    toV1(): Api.v1.Models.ActiveUser {
        return {
            id: this.id,
            userId: this.userId,
            username: this.username,
            platformData: this.platformData,
        };
    }
}

export namespace ActiveUser {
    export type Id = string;

    export type PlatformData = PlatformData.Desktop | PlatformData.Mobile;

    export namespace PlatformData {
        export interface Desktop {
            pType: 'desktop';
            cursorPos: Position
        }

        export interface Mobile {
            pType: 'mobile';
        }
    }
}
