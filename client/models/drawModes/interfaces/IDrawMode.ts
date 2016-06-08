/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../../typings/index.d.ts" />
export = IDrawMode;

interface IDrawMode {
    name:string;
    mode:string; /* 'shape' or 'sprite'*/
    playback:string; /* 'live' or 'static' */
    cumulative:boolean; /* Cleans the canvas each frame */
    data:any;
}