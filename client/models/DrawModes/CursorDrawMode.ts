/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../typings/tsd.d.ts" />

import IDrawMode = require("./Interfaces/IDrawMode");

export = CursorDrawMode;

class CursorDrawMode implements IDrawMode {
    public name:string = 'live cursors';
    public mode:string =  'sprite';
    public playback:string = 'live';
    public cumulative:boolean = false;
    public data:any = {
        ready: false,
        sprite: new Image(),
        width: 25,
        height: 25,
    };
    constructor() {
        this.data.sprite.src = "images/cursors/cursor.png";
        this.data.sprite.onload = function() {
            this.data.ready = true;
        };
    }

}