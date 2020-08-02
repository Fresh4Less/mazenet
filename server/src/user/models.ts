import * as Api from '../../../common/api';
import { Position } from '../common';

export class User {
    public id: User.Id;
    public username: string;

    constructor(v1: Api.v1.Models.User) {
        this.id = v1.id;
        this.username = v1.username;
    }
}

export namespace User {
    export type Id = string;
}

export class ActiveUser {
    public id: ActiveUser.Id;
    public userId: User.Id;
    public username: string;
    public platformData: ActiveUser.PlatformData;

    constructor(v1: Api.v1.Models.ActiveUser) {
        this.id = v1.id;
        this.userId = v1.userId;
        this.username = v1.username;
        this.platformData = v1.platformData;
    }

    public toV1(): Api.v1.Models.ActiveUser {
        return {
            id: this.id,
            platformData: this.platformData,
            userId: this.userId,
            username: this.username,
        };
    }
}

export namespace ActiveUser {
    export type Id = string;

    export type PlatformData = PlatformData.Desktop | PlatformData.Mobile;

    export namespace PlatformData {
        export interface Desktop {
            pType: 'desktop';
            cursorPos: Position;
        }

        export interface Mobile {
            pType: 'mobile';
        }
    }
}
