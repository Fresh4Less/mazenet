/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../typings/tsd.d.ts" />

import MzPosition = require('./../MzPosition');

export = IElement;

interface IElement {
    eType:string;
    creator:string;
    pos:MzPosition;
    data:any;
}