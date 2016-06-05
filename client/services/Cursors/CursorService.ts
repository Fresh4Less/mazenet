/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../typings/tsd.d.ts" />
import AnimatedCursor = require("../../models/Cursors/AnimatedCursor");
declare var _;
import ICursorService = require("./Interfaces/ICursorService");
import IDrawMode = require("../../models/DrawModes/Interfaces/IDrawMode");
import CursorDrawMode = require('../../models/DrawModes/CursorDrawMode');
import GrayLinesMode = require('../../models/DrawModes/GrayLinesMode');
import RedCircleMode = require('../../models/DrawModes/RedCircleMode');
import StaticRedLinesMode = require('../../models/DrawModes/StaticRedLinesMode');
import JensenMode = require('../../models/DrawModes/JensenMode');
import CursorFrame = require("../../models/Cursors/CursorFrame");
import IActivePageService = require("../pages/Interfaces/IActivePageService");
import ISocketService = require("../interfaces/ISocketService");
import MzPosition = require("../../models/MzPosition");

export = CursorService;

class CursorService implements ICursorService {
    static name:string = 'CursorService';

    public DrawMode:IDrawMode;
    private callbacks;
    private drawModes:IDrawMode[];
    private drawModeIndex:number;
    private cursorTimeout:boolean = true;
    private minimumAnimationLength = 30;

    /* Network timing so we don't bombard the server with more than (netTicksPerSecond) updates a second. */
    private netTicksPerSecond:number = 30;

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
        if(self.cursorTimeout && $event && $event.srcElement && $event.srcElement.clientWidth && $event.srcElement.clientHeight && $event.layerX && $event.layerY) {
            self.cursorTimeout = false;
            var cursorMove:CursorFrame = {
                pos: {
                    x: $event.layerX / $event.srcElement.clientWidth,
                    y: $event.layerY / $event.srcElement.clientHeight
                },
                t: self.frameDifference(self.ActivePageService.PageData.enterTime, new Date().getTime())
            };
            self.SocketService.CursorMove(cursorMove);

            /* Limits the cursor rate to (netTicksPerSecond)FPS */
            window.setTimeout(function() {
                self.cursorTimeout = true;
            }, (1000/self.netTicksPerSecond));
        }
    }

    public FilterCursorData(cursors:AnimatedCursor[]) {
        this.filterGarbageCursors(cursors);
    }

    private frameDifference(oldTime:number, newTime:number):number {
        var difference = newTime - oldTime;
        return Math.ceil((difference / 1000) * this.netTicksPerSecond);

    }
    /* Cleans out all those garbage cursors at like (0,0) because of mobile */
    private filterGarbageCursors(cursors:AnimatedCursor[]) {
        var animationsToRemove:AnimatedCursor[] = [];

        var self = this;
        _.each(cursors, (cursor:AnimatedCursor) => {
           cursor.frames = _.filter(cursor.frames, (frame:CursorFrame) => {
              return !MzPosition.IsEdged(frame.pos);
           });
            if(cursor.frames.length < self.minimumAnimationLength) {
                animationsToRemove.push(cursor);
            }
        });

        _.each(animationsToRemove, (cursor:AnimatedCursor)=> {
           cursors.splice(cursors.indexOf(cursor), 1);
        });

    }

}