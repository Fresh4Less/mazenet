/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */

import { MzPosition } from './MzPosition';

export class PeerData {
    public uId: string;
    public username: string;
    public pos: MzPosition;

    constructor(data?: any) {
        if (data) {
            this.uId = data.uId;
            this.username = data.username;
            this.pos = data.pos;
        } else {
            this.uId = '';
            this.username = '';
            this.pos = new MzPosition();
        }

    }

}