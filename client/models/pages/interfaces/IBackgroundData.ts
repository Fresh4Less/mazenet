/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../../typings/index.d.ts" />

export = IBackgroundData;

interface IBackgroundData {
    GetJSON():any;
    GetOppositeColorHex():string;
    GetHighContrastHex():string;
}