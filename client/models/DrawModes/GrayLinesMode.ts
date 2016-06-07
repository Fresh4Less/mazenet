/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../typings/index.d.ts" />

import IDrawMode = require("./Interfaces/IDrawMode");

export = GrayLinesMode;

class GrayLinesMode implements IDrawMode {
    public name = 'gray lines';
    public mode =  'shape';
    public playback = 'live';
    public cumulative = true;
    public data = {
        shape: 'line',
        size: 4,
        color: {
            red: 50,
            green: 50,
            blue: 50,
            alpha: 0.2
        }
    };
    constructor() {}

}