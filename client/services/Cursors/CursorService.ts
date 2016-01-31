/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../typings/tsd.d.ts" />

import ICursorService = require("./Interfaces/ICursorService");
import IDrawMode = require("../../models/DrawModes/Interfaces/IDrawMode");
import CursorDrawMode = require('../../models/DrawModes/CursorDrawMode');
import GrayLinesMode = require('../../models/DrawModes/GrayLinesMode');
import RedCircleMode = require('../../models/DrawModes/RedCircleMode');
import StaticRedLinesMode = require('../../models/DrawModes/StaticRedLinesMode');
import JensenMode = require('../../models/DrawModes/JensenMode');

export = CursorService;

class CursorService implements ICursorService {
    static name:string = 'CursorService';

    private callbacks = {
        cbDrawModeCycle: []
    };

    private drawModes:IDrawMode[] = [
        new CursorDrawMode(),
        new RedCircleMode(),
        new GrayLinesMode(),
        new StaticRedLinesMode(),
        new JensenMode()
    ];
    private drawModeIndex:number = _.size(this.drawModes)-1;
    public DrawMode:IDrawMode;

    $inject = [];
    constructor() {

    }

    OnCycleDrawMode(funct:()=>{}) {
        if(_.isFunction(funct)) {
            this.callbacks.cbDrawModeCycle.push(funct);
        }
    }
    CycleDrawMode() {

        this.drawModeIndex = (this.drawModeIndex + 1) % _.size(this.drawModes);
        this.DrawMode.name = this.drawModes[this.drawModeIndex].name;
        this.DrawMode.mode = this.drawModes[this.drawModeIndex].mode;
        this.DrawMode.playback = this.drawModes[this.drawModeIndex].playback;
        this.DrawMode.cumulative = this.drawModes[this.drawModeIndex].cumulative;
        this.DrawMode.data = this.drawModes[this.drawModeIndex].data;

        this.callbacks.cbDrawModeCycle.forEach(function(cbFunc){
            cbFunc();
        });
    }

}