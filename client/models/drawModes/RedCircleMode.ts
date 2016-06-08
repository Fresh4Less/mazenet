/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../typings/index.d.ts" />

import IDrawMode = require("./interfaces/IDrawMode");

export = RedCircleMode;

class RedCircleMode implements IDrawMode {
    public name = 'red circles';
    public mode =  'shape';
    public playback = 'live';
    public cumulative = true;
    public data = {
        shape: 'circle',
        size: 20,
        color: {
            red: 255,
            green: 50,
            blue: 50,
            alpha: 0.1
        }
    };
    constructor() {}

}