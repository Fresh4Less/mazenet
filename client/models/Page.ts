/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../typings/tsd.d.ts" />
import IElement = require("./Interfaces/IElement");
import IBackground = require("./Interfaces/IBackground");

export = Page;

class Page {
    _id:string;
    creator:string;
    owners:string[];
    permissions:string;
    title:string;
    elements:IElement[];
    background:IBackground;
}