/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../typings/tsd.d.ts" />
define(["require", "exports", '../../models/DrawModes/CursorDrawMode', '../../models/DrawModes/GrayLinesMode', '../../models/DrawModes/RedCircleMode', '../../models/DrawModes/StaticRedLinesMode', '../../models/DrawModes/JensenMode'], function (require, exports, CursorDrawMode, GrayLinesMode, RedCircleMode, StaticRedLinesMode, JensenMode) {
    var CursorService = (function () {
        function CursorService($window, ActivePageService, SocketService) {
            this.$window = $window;
            this.ActivePageService = ActivePageService;
            this.SocketService = SocketService;
            this.cursorTimeout = true;
            this.networkTiming = 30;
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
            this.drawModeIndex = _.size(this.drawModes) - 1;
        }
        CursorService.prototype.OnCycleDrawMode = function (funct) {
            if (_.isFunction(funct)) {
                this.callbacks.cbDrawModeCycle.push(funct);
            }
        };
        CursorService.prototype.CycleDrawMode = function () {
            this.drawModeIndex = (this.drawModeIndex + 1) % _.size(this.drawModes);
            this.DrawMode.name = this.drawModes[this.drawModeIndex].name;
            this.DrawMode.mode = this.drawModes[this.drawModeIndex].mode;
            this.DrawMode.playback = this.drawModes[this.drawModeIndex].playback;
            this.DrawMode.cumulative = this.drawModes[this.drawModeIndex].cumulative;
            this.DrawMode.data = this.drawModes[this.drawModeIndex].data;
            this.callbacks.cbDrawModeCycle.forEach(function (cbFunc) {
                cbFunc();
            });
        };
        CursorService.prototype.UserMovedCursor = function ($event) {
            if (this.cursorTimeout) {
                this.cursorTimeout = false;
                var cursorMove = {
                    pos: {
                        x: $event.clientX / this.$window.innerWidth,
                        y: $event.clientY / this.$window.innerHeight
                    },
                    t: this.frameDifference(this.ActivePageService.PageData.enterTime, new Date().getTime())
                };
                this.SocketService.CursorMove(cursorMove);
                /* Limits the cursor rate to (networkTiming)FPS */
                window.setTimeout(function () {
                    this.cursorTimeout = true;
                }, (1000 / this.networkTiming));
            }
        };
        CursorService.prototype.frameDifference = function (oldTime, newTime) {
            var difference = newTime - oldTime;
            return Math.ceil((difference / 1000) * this.networkTiming);
        };
        CursorService.name = 'CursorService';
        CursorService.$inject = [
            '$window',
            'ActivePageService',
            'SocketService',
        ];
        return CursorService;
    })();
    return CursorService;
});
//# sourceMappingURL=CursorService.js.map