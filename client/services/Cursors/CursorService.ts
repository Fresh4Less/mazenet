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

    static FactoryDefinition = [
        '$window',
        'ActivePageService',
        'SocketService',
        ($window:ng.IWindowService,
         ActivePageService:IActivePageService,
         SocketService:ISocketService) => {return new CursorService($window, ActivePageService, SocketService);}
    ];
    constructor(private $window:ng.IWindowService,
                private ActivePageService:IActivePageService,
                private SocketService:ISocketService) {
        this.DrawMode = {name:'', mode:'', playback:'', cumulative:false, data:''};
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
        this.CycleDrawMode();
    }

    public OnCycleDrawMode(func:()=>void) {
        if(_.isFunction(func)) {
            this.callbacks.cbDrawModeCycle.push(func);
        }
    }

    public CycleDrawMode() {

        this.drawModeIndex = (this.drawModeIndex + 1) % _.size(this.drawModes);
        var nextMode:IDrawMode = this.drawModes[this.drawModeIndex];
        this.DrawMode.name = nextMode.name;
        this.DrawMode.mode = nextMode.mode;
        this.DrawMode.playback = nextMode.playback;
        this.DrawMode.cumulative = nextMode.cumulative;
        this.DrawMode.data = nextMode.data;

        _.forEach(this.callbacks.cbDrawModeCycle, (func: ()=>void) => {
            func();
        });
    }

    public UserMovedCursor($event:MouseEvent) {
        var self = this;
        if(self.cursorTimeout && $event.srcElement && $event.srcElement.clientWidth && $event.srcElement.clientHeight) {
            self.cursorTimeout = false;
            var cursorMove:CursorFrame = {
                pos: {
                    x: $event.layerX / $event.srcElement.clientWidth,
                    y: $event.layerY / $event.srcElement.clientHeight
                },
                t: self.frameDifference(self.ActivePageService.PageData.enterTime, new Date().getTime())
            };
            self.SocketService.CursorMove(cursorMove);

            /* Limits the cursor rate to (networkTiming)FPS */
            window.setTimeout(function() {
                self.cursorTimeout = true;
            }, (1000/self.networkTiming));
        }
    }

    private frameDifference(oldTime:number, newTime:number):number {
        var difference = newTime - oldTime;
        return Math.ceil((difference / 1000) * this.networkTiming);

    }

}