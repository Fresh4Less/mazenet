/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../typings/tsd.d.ts" />
define(["require", "exports", "../../models/Canvas/Sprite"], function (require, exports, Sprite) {
    //TODO Refactor all this junk into its own service
    var CanvasController = (function () {
        function CanvasController($scope, $timeout, ActivePageService, CursorService) {
            this.$scope = $scope;
            this.$timeout = $timeout;
            this.ActivePageService = ActivePageService;
            this.CursorService = CursorService;
            this.id = '0';
            this.target = null;
            this.globalPageStyles = ActivePageService.Styles;
            this.fps = 30;
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            this.canvas = null;
            this.ctx = null;
            //TODO this.cursorTimeMarkers = [];
            this.cursorMaxTime = 0;
            this.timer = 0;
            this.activeRoomTime = 0;
            var self = this;
            CursorService.OnCycleDrawMode(function () { self.resetCanvas(); });
            $timeout(function () {
                self.canvas = document.getElementById('canvas-' + self.id);
                if (!self.canvas) {
                    console.error("Error loading canvas.", self);
                    return;
                }
                self.canvas.setAttribute('width', window.innerWidth.toString());
                self.canvas.setAttribute('height', window.innerHeight.toString());
                self.ctx = self.canvas.getContext('2d');
                self.rootRenderLoop();
            });
        }
        /* Run once every animation frame. Chooses the draw style  and renders it.
         * Resets the canvas if that page has changed. */
        CanvasController.prototype.rootRenderLoop = function () {
            var self = this;
            var loopCallback = function () {
                setTimeout(function () {
                    window.requestAnimationFrame(loopCallback);
                    if (self.ctx) {
                        /* Check if the user has resized the window */
                        if (self.width != window.innerWidth) {
                            self.width = window.innerWidth;
                            self.canvas.setAttribute('width', self.width.toString());
                        }
                        if (self.height != window.innerHeight) {
                            self.height = window.innerHeight;
                            self.canvas.setAttribute('height', self.height.toString());
                        }
                        /* Enter time mismatch means the room changed. */
                        if (self.activeRoomTime != self.ActivePageService.PageData.enterTime) {
                            self.resetCanvas();
                        }
                        /* Draw the next frame depending on the DrawMode */
                        if (self.ActivePageService.PageData.cursors) {
                            if (self.CursorService.DrawMode.mode === 'sprite') {
                                if (self.CursorService.DrawMode.playback === 'live') {
                                    self.LiveSpriteNextFrame();
                                }
                                else if (self.CursorService.DrawMode.playback === 'static') {
                                    self.StaticSpriteNextFrame();
                                }
                            }
                            else if (self.CursorService.DrawMode.mode === 'shape') {
                                if (self.CursorService.DrawMode.playback === 'live') {
                                    self.LiveShapeNextFrame();
                                }
                                else if (self.CursorService.DrawMode.playback === 'static') {
                                    self.StaticShapeNextFrame();
                                }
                            }
                        }
                    }
                }, 1000 / self.fps);
            };
            loopCallback();
        };
        /* Draws the next frame of the cursors in the form of a sprite.
         * The sprite info is defined within the CursorService.
         * If the DrawMode is set to cumulative, the canvas does not clear between frames. */
        CanvasController.prototype.LiveSpriteNextFrame = function () {
            if (this.CursorService.DrawMode.data.ready) {
                if (!this.CursorService.DrawMode.cumulative) {
                    this.ctx.clearRect(0, 0, this.width, this.height);
                }
                var options = {
                    context: this.ctx,
                    width: this.CursorService.DrawMode.data.width,
                    height: this.CursorService.DrawMode.data.height,
                    image: this.CursorService.DrawMode.data.sprite
                };
                var cursorSprite = new Sprite(options);
                var cursorsToRender = this.getLatestCursors();
                var self = this;
                _.forEach(cursorsToRender, function (cursorData) {
                    cursorSprite.Render(cursorData.pos.x * self.width, cursorData.pos.y * self.height);
                });
                this.timer++;
            }
        };
        /* Draws a static form of the cursor data in the form of sprites.
         * The sprite info is defined within the CursorService.
         * If the DrawMode is set to cumulative all cursors frames are rendered together. */
        CanvasController.prototype.StaticSpriteNextFrame = function () {
            var self = this;
            if (self.CursorService.DrawMode.data.ready) {
                if (self.timer === 0) {
                    var options = {
                        context: self.ctx,
                        width: self.CursorService.DrawMode.data.width,
                        height: self.CursorService.DrawMode.data.height,
                        image: self.CursorService.DrawMode.data.sprite
                    };
                    var cursorSprite = new Sprite(options);
                    if (this.CursorService.DrawMode.cumulative) {
                        for (var i = 0; i < self.ActivePageService.PageData.cursors.length; i++) {
                            _.forEach(self.ActivePageService.PageData.cursors[i].frames, function (cursorData) {
                                cursorSprite.Render(cursorData.pos.x * self.width, cursorData.pos.y * self.height);
                            });
                        }
                    }
                    else {
                        var cursorsToRender = self.getFinalCursorFrames();
                        _.forEach(cursorsToRender, function (cursorData) {
                            cursorSprite.Render(cursorData.pos.x * self.width, cursorData.pos.y * self.height);
                        });
                    }
                }
            }
            this.timer++;
        };
        /* Draws the next frame of the cursors in the form of a shape.
         * The shape info is defined within the CursorService.
         * If the DrawMode is set to cumulative, the canvas does not clear between frames. */
        CanvasController.prototype.LiveShapeNextFrame = function () {
            var self = this;
            self.ConfigureContextByShapeData(self.CursorService.DrawMode.data);
            if (!self.CursorService.DrawMode.cumulative) {
                self.ctx.clearRect(0, 0, self.width, self.height);
            }
            var cursorsToRender = self.getCursorsAtCurrentTime();
            var previousCursors = self.getCursorsAtCurrentTimeBackAFrame();
            for (var i = 0; i < cursorsToRender.length; i++) {
                self.DrawShapeFrame(self.CursorService.DrawMode.data, cursorsToRender[i], previousCursors[i]);
            }
            self.timer++;
        };
        /* Draws a static form of the cursor data in the form of shapes.
         * The shape info is defined within the CursorService.
         * If the DrawMode is set to cumulative all cursors frames are rendered together. */
        CanvasController.prototype.StaticShapeNextFrame = function () {
            var self = this;
            if (self.timer < 30) {
                self.ConfigureContextByShapeData(self.CursorService.DrawMode.data);
                var previousCursors;
                var cursorsToRender;
                if (self.CursorService.DrawMode.cumulative) {
                    for (var i = 0; i < self.ActivePageService.PageData.cursors.length; i++) {
                        for (var j = 0; j < self.ActivePageService.PageData.cursors[i].frames.length; j++) {
                            var cursorToRender = self.ActivePageService.PageData.cursors[i].frames[j];
                            var prevCursorToRender = self.ActivePageService.PageData.cursors[i].frames[Math.max(j - 1, 0)];
                            self.DrawShapeFrame(self.CursorService.DrawMode.data, cursorToRender, prevCursorToRender);
                        }
                    }
                }
                cursorsToRender = self.getLatestCursors();
                previousCursors = self.getLatestCursorsBackAFrame();
                for (var i = 0; i < cursorsToRender.length; i++) {
                    self.DrawShapeFrame(self.CursorService.DrawMode.data, cursorsToRender[i], previousCursors[i]);
                }
            }
            this.timer++;
        };
        CanvasController.prototype.ConfigureContextByShapeData = function (shapeData) {
            var colorString = "rgba(10, 10, 10, 0.01)";
            if (shapeData.color) {
                colorString = "rgba(" + shapeData.color.red + ", " + shapeData.color.green + ", " + shapeData.color.blue + ", " + shapeData.color.alpha + ")";
            }
            if (shapeData.shape === 'line') {
                this.ctx.strokeStyle = colorString;
                this.ctx.lineWidth = shapeData.size | 1;
            }
            else if (shapeData.shape === 'rect') {
                this.ctx.fillStyle = colorString;
            }
            else if (shapeData.shape === 'circle') {
            }
            else {
                console.error("ConfigureContextByShapeData: shapeData.shape unsupported.", shapeData);
            }
        };
        CanvasController.prototype.DrawShapeFrame = function (shapeData, cursor, prevCursor) {
            var self = this;
            if (shapeData.shape === 'line') {
                if (!prevCursor) {
                    console.error("DrawShapeFrame: prevCursor required to draw a line.");
                    return;
                }
                self.ctx.beginPath();
                self.ctx.moveTo(prevCursor.pos.x * self.width, prevCursor.pos.x * self.height);
                self.ctx.moveTo(cursor.pos.x * self.width, cursor.pos.x * self.height);
                self.ctx.stroke();
            }
            else if (shapeData.shape === 'rect') {
                self.ctx.fillRect(cursor.pos.x * self.width, cursor.pos.y * self.height, shapeData.size, shapeData.size);
            }
            else if (shapeData.shape === 'circle') {
                var colorString = "rgba(10, 10, 10, 0.01)";
                var colorStringTransparent = "rgba(10, 10, 10, 0.0)";
                if (shapeData.color) {
                    colorString = "rgba(" + shapeData.color.red + ", " + shapeData.color.green + ", " + shapeData.color.blue + ", " + shapeData.color.alpha + ")";
                    colorStringTransparent = "rgba(" + shapeData.color.red + ", " + shapeData.color.green + ", " + shapeData.color.blue + ", 0.0)";
                }
                else {
                    console.error("ConfigureContextByShapeData: shapeData does not contain color info.", shapeData);
                }
                var radius = 20;
                var gradient = this.ctx.createRadialGradient(cursor.pos.x * self.width + radius, cursor.pos.y * self.height + radius, radius, cursor.pos.x * self.width + radius, cursor.pos.y * self.height + radius, radius * 0.95);
                gradient.addColorStop(1, colorString);
                gradient.addColorStop(0, colorStringTransparent);
                self.ctx.fillStyle = gradient;
                self.ctx.fillRect(cursor.pos.x * self.width, cursor.pos.y * self.height, radius * 2, radius * 2);
            }
            else {
                console.error("DrawShapeFrame: shapeData.shape unsupported.", shapeData);
            }
        };
        CanvasController.prototype.getLatestCursors = function () {
            var outArr = [];
            var self = this;
            _.forEach(self.ActivePageService.PageData.cursors, function (cursors) {
                var latestCursor = cursors.frames[0];
                for (var i = 1; i < cursors.frames.length; i++) {
                    if (cursors.frames[i].t > self.timer) {
                        break;
                    }
                    latestCursor = cursors.frames[i];
                }
                if (latestCursor) {
                    outArr.push(latestCursor);
                }
            });
            return outArr;
        };
        CanvasController.prototype.getLatestCursorsBackAFrame = function () {
            var outArr = [];
            var self = this;
            _.forEach(self.ActivePageService.PageData.cursors, function (cursors) {
                var latestCursorBackAFrame = cursors.frames[0];
                var latestCursor = cursors.frames[0];
                for (var i = 1; i < cursors.frames.length; i++) {
                    if (cursors.frames[i].t > self.timer) {
                        break;
                    }
                    latestCursorBackAFrame = latestCursor;
                    latestCursor = cursors.frames[i];
                }
                if (latestCursorBackAFrame) {
                    outArr.push(latestCursorBackAFrame);
                }
            });
            return outArr;
        };
        CanvasController.prototype.getFinalCursorFrames = function () {
            var outArr = [];
            var self = this;
            _.forEach(self.ActivePageService.PageData.cursors, function (cursors) {
                outArr.push(cursors.frames[cursors.frames.length - 1]);
            });
            return outArr;
        };
        /*TODO Implement binary search when the cursors are sorted.*/
        CanvasController.prototype.getCursorsAtCurrentTime = function () {
            var outArr = [];
            var self = this;
            _.forEach(self.ActivePageService.PageData.cursors, function (cursors) {
                for (var i = 0; i < cursors.frames.length; i++) {
                    if (cursors.frames[i].t == self.timer) {
                        outArr.push(cursors.frames[i]);
                    }
                }
            });
            return outArr;
        };
        CanvasController.prototype.getCursorsAtCurrentTimeBackAFrame = function () {
            var outArr = [];
            var self = this;
            _.forEach(self.ActivePageService.PageData.cursors, function (cursors) {
                for (var i = 0; i < cursors.frames.length; i++) {
                    if (cursors.frames[i].t == self.timer) {
                        outArr.push(cursors.frames[Math.max(i - 1, 0)]);
                    }
                }
            });
            return outArr;
        };
        /** REMOVED INTERPOLATION BULLSHIT
         * Gets the next cursor for the timer.
         * If the next cursor is on a timestamp far ahead of the timer,
         * it interpolates a cursor postion for the timer.
         * GetCurrentCursors will return whatever the most recent call to GetNextCursors returned.*
        private GetNextCursors() {
            var self = this;
            var outArr = [];
            for(var i = 0; i < self.ActivePageService.PageData.cursors.length; i++) {
                var currentCursor = self.ActivePageService.PageData.cursors[i].frames[self.cursorTimeMarkers[i]];
                if((this.ActivePageService.PageData.cursors[i].frames.length - 1) > self.cursorTimeMarkers[i]) { //There are more cursors
                    var nextCursor = self.ActivePageService.PageData.cursors[i].frames[self.cursorTimeMarkers[i] + 1];
                    if(nextCursor.t > self.timer) {
                        if(currentCursor.pos.x === 0 || currentCursor.pos.y === 0) {
                            outArr.push(currentCursor);
                        } else {
                            var interpPercent = (self.timer - currentCursor.t)/(nextCursor.t - currentCursor.t);
                            var interpolatedCursor = {
                                t: self.timer,
                                pos: {
                                    x: (currentCursor.pos.x + ((nextCursor.pos.x - currentCursor.pos.x) * interpPercent)),
                                    y: (currentCursor.pos.y + ((nextCursor.pos.y - currentCursor.pos.y) * interpPercent))
                                }
                            };
                            outArr.push(interpolatedCursor);
                        }
                    } else {
                        outArr.push(nextCursor);
                        self.cursorTimeMarkers[i]++;
                    }
                } else {
                    outArr.push(currentCursor);
                }
            }
            return outArr;
        }
        * Get the current cursors as specified by the cursorTimeMarkers array.
         * Returns whatever the most recent call to GetNextCursors returned. *
        private GetCurrentCursors() {
            var self = this;
            var outArr = [];
            for(var i = 0; i < self.ActivePageService.PageData.cursors.length; i++) {
                var currentCursor = self.ActivePageService.PageData.cursors[i].frames[self.cursorTimeMarkers[i]];
                outArr.push(currentCursor);
            }
            return outArr;
        }
    
        /* Gets the final cursor frame for every page's cursors. *
        private GetLastCursors() {
            var outArr = [];
            for(var i = 0; i < this.ActivePageService.PageData.cursors.length; i++) {
                var framesLen = this.ActivePageService.PageData.cursors[i].frames.length;
                outArr.push(this.ActivePageService.PageData.cursors.length[i][framesLen - 1]);
            }
            return outArr;
        }
        */
        /* Resets the canvas by resetting timers, cursors, and clearing the canvas */
        CanvasController.prototype.resetCanvas = function () {
            this.activeRoomTime = this.ActivePageService.PageData.enterTime;
            this.timer = 0;
            this.ctx.clearRect(0, 0, this.width, this.height);
            //this.cursorTimeMarkers = [];
            this.cursorMaxTime = 0;
            var self = this;
            _.forEach(this.ActivePageService.PageData.cursors, function (cursor) {
                var oldestTime = cursor.frames[cursor.frames.length - 1].t;
                if (oldestTime > self.cursorMaxTime) {
                    self.cursorMaxTime = oldestTime;
                }
                //self.cursorTimeMarkers.push(0);
            });
        };
        CanvasController.$inject = [
            '$scope',
            '$timeout',
            'ActivePageService',
            'CursorService'
        ];
        return CanvasController;
    })();
    return CanvasController;
});
//# sourceMappingURL=CanvasController.js.map