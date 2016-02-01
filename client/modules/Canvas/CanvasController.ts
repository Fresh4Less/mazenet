/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../typings/tsd.d.ts" />

import PageStyles = require("../../models/Pages/PageStyles");
import IActivePageService = require("../../services/Pages/Interfaces/IActivePageService");
import ICursorService = require("../../services/Cursors/Interfaces/ICursorService");
import SpriteOptions = require("../../models/Canvas/SpriteOptions");
import Sprite = require("../../models/Canvas/Sprite");
import CursorFrame = require("../../models/Cursors/CursorFrame");
import Cursor = require("../../models/Cursors/Cursor");
import AnimatedCursor = require("../../models/Cursors/AnimatedCursor");

export = CanvasController;

//TODO Refactor all this junk into its own service
class CanvasController {
    public id:string;
    public target:any;
    public globalPageStyles:PageStyles;

    private fps:number;
    private width:number;
    private height:number;
    private canvas:HTMLCanvasElement;
    private ctx:CanvasRenderingContext2D;
    private cursorTimeMarkers:number[];
    private cursorMaxTime:number;
    private timer:number;
    private activeRoomTime:number;

    static $inject = [
        '$scope',
        '$timeout',
        'ActivePageService',
        'CursorService'

    ];

    constructor(private $scope:ng.IScope,
                private $timeout:ng.ITimeoutService,
                private ActivePageService:IActivePageService,
                private CursorService:ICursorService) {
        this.id = '0';
        this.target = null;
        this.globalPageStyles = ActivePageService.Styles;
        this.fps = 30;
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas = null;
        this.ctx = null;
        this.cursorTimeMarkers = [];
        this.cursorMaxTime = 0;
        this.timer = 0;
        this.activeRoomTime = 0;

        CursorService.OnCycleDrawMode(this.resetCanvas);

        var unbindWatch = $scope.$watch('target', function(newValue, oldValue) {
            if(newValue) {
                $timeout(function() {
                    this.canvas = document.getElementById('canvas-'+this.id);

                    if(!this.canvas) {
                        console.error("Error loading canvas.", newValue);
                        return;
                    }

                    this.canvas.setAttribute('width', window.innerWidth);
                    this.canvas.setAttribute('height', window.innerHeight);
                    this.ctx = this.canvas.getContext('2d');
                    this.rootRenderLoop();

                    unbindWatch();
                });
            }
        });
    }

    /* Run once every animation frame. Chooses the draw style  and renders it.
     * Resets the canvas if that page has changed. */
    private rootRenderLoop () {
        setTimeout(function() {
            window.requestAnimationFrame(this.rootRenderLoop);
            if(this.ctx) {

                /* Check if the user has resized the window */
                if(this.width != window.innerWidth) {
                    this.width = window.innerWidth;
                    this.canvas.setAttribute('width', this.width);
                }
                if(this.height != window.innerHeight) {
                    this.height = window.innerHeight;
                    this.canvas.setAttribute('height', this.height);
                }

                /* Enter time mismatch means the room changed. */
                if(this.activeRoomTime != this.ActivePageService.PageData.enterTime) {
                    this.resetCanvas();
                }

                /* Draw the next frame depending on the DrawMode */
                if(this.ActivePageService.PageData.cursors) {
                    if(this.CursorService.DrawMode.mode === 'sprite') {
                        if(this.CursorService.DrawMode.playback === 'live') {
                            this.LiveSpriteNextFrame();
                        } else if(this.CursorService.DrawMode.playback === 'static') {
                            this.StaticSpriteNextFrame();
                        }
                    } else if(this.CursorService.DrawMode.mode === 'shape') {
                        if(this.CursorService.DrawMode.playback === 'live') {
                            this.LiveShapeNextFrame();
                        } else if(this.CursorService.DrawMode.playback === 'static') {
                            this.StaticShapeNextFrame();
                        }
                    }

                }
            }
        }, 1000/this.fps);
    }


    /* Draws the next frame of the cursors in the form of a sprite.
     * The sprite info is defined within the CursorService.
     * If the DrawMode is set to cumulative, the canvas does not clear between frames. */
    private LiveSpriteNextFrame() {
        if(this.CursorService.DrawMode.data.ready){
            if(!this.CursorService.DrawMode.cumulative) {
                this.ctx.clearRect(0,0,this.width,this.height);
            }
            var options = <SpriteOptions>{
                context: this.ctx,
                width: this.CursorService.DrawMode.data.width,
                height: this.CursorService.DrawMode.data.height,
                image: this.CursorService.DrawMode.data.sprite
            };
            var cursorSprite = new Sprite(options);

            var cursorsToRender = this.GetNextCursors();
            _.forEach(cursorsToRender, function(cursorData:CursorFrame) {
                cursorSprite.Render(cursorData.pos.x * this.width, cursorData.pos.y * this.height);
            });
            this.timer++;
        }
    }

    /* Draws a static form of the cursor data in the form of sprites.
     * The sprite info is defined within the CursorService.
     * If the DrawMode is set to cumulative all cursors frames are rendered together. */
    private StaticSpriteNextFrame() {
        if(this.CursorService.DrawMode.data.ready){
            if(this.timer === 0) {
                var options = <SpriteOptions> {
                    context: this.ctx,
                    width: this.CursorService.DrawMode.data.width,
                    height: this.CursorService.DrawMode.data.height,
                    image: this.CursorService.DrawMode.data.sprite
                };

                var cursorSprite = new Sprite(options);
                var cursorsToRender;

                if(this.CursorService.DrawMode.cumulative) {
                    var renderSprite = function(cursorData:CursorFrame) {
                        cursorSprite.Render(cursorData.pos.x * this.width, cursorData.pos.y * this.height);
                    };
                    for (var i = 0; i < this.cursorMaxTime; i++) {
                        cursorsToRender = this.GetNextCursors();
                        _.forEach(cursorsToRender, renderSprite);
                    }
                }
                cursorsToRender = this.GetLastCursors();
                _.forEach(cursorsToRender, function(cursorData:CursorFrame) {
                    cursorSprite.Render(cursorData.pos.x * this.width, cursorData.pos.y * this.height);
                });
                this.timer++;
            }
        }
    }

    /* Draws the next frame of the cursors in the form of a shape.
     * The shape info is defined within the CursorService.
     * If the DrawMode is set to cumulative, the canvas does not clear between frames. */
    private LiveShapeNextFrame() {
        this.ConfigureContextByShapeData(this.CursorService.DrawMode.data);

        if(!this.CursorService.DrawMode.cumulative) {
            this.ctx.clearRect(0,0,this.width,this.height);
        }
        var previousCursors = this.GetCurrentCursors();
        var cursorsToRender = this.GetNextCursors();
        for (var i = 0; i < cursorsToRender.length; i++) {
            this.DrawShapeFrame(this.CursorService.DrawMode.data, cursorsToRender[i],previousCursors[i]);
        }

        this.timer++;
    }

    /* Draws a static form of the cursor data in the form of shapes.
     * The shape info is defined within the CursorService.
     * If the DrawMode is set to cumulative all cursors frames are rendered together. */
    private StaticShapeNextFrame() {
        if(this.timer < 30) {
            this.ConfigureContextByShapeData(this.CursorService.DrawMode.data);
            var previousCursors;
            var cursorsToRender;
            if(this.CursorService.DrawMode.cumulative) {
                var drawShape = function(cursorData) {
                    this.DrawShapeFrame(this.CursorService.DrawMode.data, cursorData);
                };
                for (var i = 0; i < this.cursorMaxTime; i++) {
                    previousCursors = this.GetCurrentCursors();
                    cursorsToRender = this.GetNextCursors();
                    _.forEach(cursorsToRender, drawShape);
                }
            }

            previousCursors = this.GetCurrentCursors();
            cursorsToRender = this.GetNextCursors();
            for (var i = 0; i < cursorsToRender.length; i++) {
                this.DrawShapeFrame(this.CursorService.DrawMode.data, cursorsToRender[i],previousCursors[i]);
            }

            this.timer++;
        }
    }

    private ConfigureContextByShapeData(shapeData) {
        var colorString = "rgba(10, 10, 10, 0.01)";
        if(shapeData.color) {
            colorString = "rgba(" + shapeData.color.red + ", " + shapeData.color.green + ", " + shapeData.color.blue + ", " + shapeData.color.alpha  + ")";
        } else {
            console.error("ConfigureContextByShapeData: shapeData does not contain color info.", shapeData);
        }
        if(shapeData.shape === 'line') {
            this.ctx.strokeStyle = colorString;
            this.ctx.lineWidth = shapeData.size | 1;
        } else if(shapeData.shape === 'rect') {
            this.ctx.fillStyle = colorString;
        } else if(shapeData.shape === 'circle') {
            /* Must be done with the specific cursor frame data present. */
        } else {
            console.error("ConfigureContextByShapeData: shapeData.shape unsupported.", shapeData);
        }
    }

    private DrawShapeFrame(shapeData, cursor, prevCursor) {
        if(shapeData.shape === 'line') {
            if(!prevCursor) {
                console.error("DrawShapeFrame: prevCursor required to draw a line.");
                return;
            }
            this.ctx.beginPath();
            this.ctx.moveTo(prevCursor.pos.x * this.width, prevCursor.pos.x * this.height);
            this.ctx.moveTo(cursor.pos.x * this.width, cursor.pos.x * this.height);
            this.ctx.stroke();
        } else if(shapeData.shape === 'rect') {
            this.ctx.fillRect(cursor.pos.x * this.width, cursor.pos.y * this.height, shapeData.size, shapeData.size);
        } else if(shapeData.shape === 'circle') {
            var colorString = "rgba(10, 10, 10, 0.01)";
            var colorStringTransparent = "rgba(10, 10, 10, 0.0)";
            if(shapeData.color) {
                colorString = "rgba(" + shapeData.color.red + ", " + shapeData.color.green + ", " + shapeData.color.blue + ", " + shapeData.color.alpha  + ")";
                colorStringTransparent = "rgba(" + shapeData.color.red + ", " + shapeData.color.green + ", " + shapeData.color.blue + ", 0.0)";
            } else {
                console.error("ConfigureContextByShapeData: shapeData does not contain color info.", shapeData);
            }
            var radius = 20;
            var gradient = this.ctx.createRadialGradient(cursor.pos.x * this.width + radius, cursor.pos.y * this.height + radius, radius, cursor.pos.x * this.width+radius, cursor.pos.y * this.height+radius,radius*0.95);
            gradient.addColorStop(1, colorString);
            gradient.addColorStop(0, colorStringTransparent);
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(cursor.pos.x * this.width, cursor.pos.y * this.height, radius*2, radius*2);
        } else {
            console.error("DrawShapeFrame: shapeData.shape unsupported.", shapeData);
        }
    }

    /* Gets the next cursor for the timer.
     * If the next cursor is on a timestamp far ahead of the timer,
     * it interpolates a cursor postion for the timer.
     * GetCurrentCursors will return whatever the most recent call to GetNextCursors returned.*/
    private GetNextCursors() {
        var outArr = [];
        for(var i = 0; i < this.ActivePageService.PageData.cursors.length; i++) {
            var currentCursor = this.ActivePageService.PageData.cursors[i].frames[this.cursorTimeMarkers[i]];
            if((this.ActivePageService.PageData.cursors[i].frames.length - 1) > this.cursorTimeMarkers[i]) { //There are more cursors
                var nextCursor = this.ActivePageService.PageData.cursors[i].frames[this.cursorTimeMarkers[i] + 1];
                if(nextCursor.t > this.timer) {
                    if(currentCursor.pos.x === 0 || currentCursor.pos.y === 0) {
                        outArr.push(currentCursor);
                    } else {
                        var interpPercent = (this.timer - currentCursor.t)/(nextCursor.t - currentCursor.t);
                        var interpolatedCursor = {
                            t: this.timer,
                            pos: {
                                x: (currentCursor.pos.x + ((nextCursor.pos.x - currentCursor.pos.x) * interpPercent)),
                                y: (currentCursor.pos.y + ((nextCursor.pos.y - currentCursor.pos.y) * interpPercent))
                            }
                        };
                        outArr.push(interpolatedCursor);
                    }
                } else {
                    outArr.push(nextCursor);
                    this.cursorTimeMarkers[i]++;
                }
            } else {
                outArr.push(currentCursor);
            }
        }
        return outArr;
    }
    /* Get the current cursors as specified by the cursorTimeMarkers array.
     * Returns whatever the most recent call to GetNextCursors returned. */
    private GetCurrentCursors() {
        var outArr = [];
        for(var i = 0; i < this.ActivePageService.PageData.cursors.length; i++) {
            var currentCursor = this.ActivePageService.PageData.cursors[i].frames[this.cursorTimeMarkers[i]];
            outArr.push(currentCursor);
        }
        return outArr;
    }

    /* Gets the final cursor frame for every page's cursors. */
    private GetLastCursors() {
        var outArr = [];
        for(var i = 0; i < this.ActivePageService.PageData.cursors.length; i++) {
            var framesLen = this.ActivePageService.PageData.cursors[i].frames.length;
            outArr.push(this.ActivePageService.PageData.cursors.length[i][framesLen - 1]);
        }
        return outArr;
    }

    /* Resets the canvas by resetting timers, cursors, and clearing the canvas */
    private resetCanvas() {
        this.activeRoomTime = this.ActivePageService.PageData.enterTime;
        this.timer = 0;
        this.ctx.clearRect(0, 0, this.width, this.height);

        this.cursorTimeMarkers = [];
        this.cursorMaxTime = 0;
        _.forEach(this.ActivePageService.PageData.cursors, function(cursor:AnimatedCursor) {
            var oldestTime = cursor.frames[cursor.frames.length-1].t;
            if(oldestTime > this.cursorMaxTime) {
                this.cursorMaxTime = oldestTime;
            }
            this.cursorTimeMarkers.push(0);
        });
    }
}