/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../typings/tsd.d.ts" />

import ICursorService = require("./Interfaces/ICursorService");
import IDrawMode = require("../../models/DrawModes/Interfaces/IDrawMode");
import CursorDrawMode = require('../../models/DrawModes/CursorDrawMode');
import GrayLinesMode = require('../../models/DrawModes/GrayLinesMode');
import RedCircleMode = require('../../models/DrawModes/RedCircleMode');
import StaticRedLinesMode = require('../../models/DrawModes/StaticRedLinesMode');
import JensenMode = require('../../models/DrawModes/JensenMode');
import CursorFrame = require("../../models/Cursors/CursorFrame");
import IActivePageService = require("../Pages/Interfaces/IActivePageService");
import ISocketService = require("../Interfaces/ISocketService");

export = CursorService;

class CursorService implements ICursorService {
    static name:string = 'CursorService';

    public DrawMode:IDrawMode;
    private callbacks;
    private drawModes:IDrawMode[];
    private drawModeIndex:number;
    private cursorTimeout:boolean = true;
    private networkTiming:number = 30;

    static $inject = [
        '$window',
        'ActivePageService',
        'SocketService',
    ];
    constructor(private $window:ng.IWindowService,
                private ActivePageService:IActivePageService,
                private SocketService:ISocketService) {
        this.callbacks = {
            cbDrawModeCycle: []
        };
        this.drawModes = [
            new CursorDrawMode(),
            new RedCircleMode(),
            new GrayLinesMode(),
            new StaticRedLinesMode(),
            new JensenMode()
        ];
        this.drawModeIndex = _.size(this.drawModes)-1;
    }

    OnCycleDrawMode(funct:()=>void) {
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

    UserMovedCursor($event:MouseEvent) {
        if(this.cursorTimeout) {
            this.cursorTimeout = false;

            var cursorMove:CursorFrame = {
                pos: {
                    x: $event.clientX / this.$window.innerWidth,
                    y: $event.clientY / this.$window.innerHeight
                },
                t: this.frameDifference(this.ActivePageService.PageData.enterTime, new Date().getTime())
            };

            this.SocketService.CursorMove(cursorMove);

            /* Limits the cursor rate to (networkTiming)FPS */
            window.setTimeout(function() {
                this.cursorTimeout = true;
            }, (1000/this.networkTiming));
        }
    }

    private frameDifference(oldTime:number, newTime:number):number {
        var difference = newTime - oldTime;
        return Math.ceil((difference / 1000) * this.networkTiming);

    }

}