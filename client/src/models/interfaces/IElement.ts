/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */

import { MzPosition } from '../MzPosition';

export interface IElement {
    eType: string;
    creator: string;
    pos: MzPosition;
    data: any;
}