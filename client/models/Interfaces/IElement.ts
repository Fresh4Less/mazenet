/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../typings/tsd.d.ts" />

import Position = require('./../Position');

export = IElement;

interface IElement {
    eType:string;
    pos:Position;
    data:any;
}