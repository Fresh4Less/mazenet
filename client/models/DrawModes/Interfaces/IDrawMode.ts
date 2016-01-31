/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../../typings/tsd.d.ts" />
export = IDrawMode;

interface IDrawMode {
    name:string;
    mode:string;
    playback:string;
    cumulative:boolean;
    data:any;
}