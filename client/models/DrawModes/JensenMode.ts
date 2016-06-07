/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../typings/index.d.ts" />

import IDrawMode = require("./Interfaces/IDrawMode");

export = JensenMode;

class JensenMode implements IDrawMode {
    public name = 'Peter Jensen';
    public mode =  'sprite';
    public playback = 'live';
    public cumulative = false;
    public data = {
        ready: false,
        sprite: new Image(),
        width: 37,
        height: 50,
    };
    constructor() {
        var self = this;
        this.data.sprite.src = "images/cursors/peter_jensen.png";
        this.data.sprite.onload = function() {
            self.data.ready = true;
        };
    }

}