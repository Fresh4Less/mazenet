/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */

import { PeerData } from './PeerData';

export class UserData extends PeerData {
    public RootPageId: string;
    public HomePageId: string;

    constructor(data?: any) {
        super(data);
        if (data) {
            this.RootPageId = data.rootPageId;
            this.HomePageId = data.homepageId;
        }
    }
}