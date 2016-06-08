/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../typings/index.d.ts" />

import IDrawMode = require("./Interfaces/IDrawMode");

export = StaticRedLinesMode;

class StaticRedLinesMode implements IDrawMode {
    public name = 'static red lines';
    public mode =  'shape';
    public playback = 'static';
    public cumulative = true;
    public data = {
        shape: 'line',
        size: 1,
        color: {
            red: 255,
            green: 50,
            blue: 50,
            alpha: 0.1
        }
    };
    constructor() {}

}