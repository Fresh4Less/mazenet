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
            this.DrawMode = { name: '', mode: '', playback: '', cumulative: false, data: '' };
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
            this.CycleDrawMode();
        }
        CursorService.prototype.OnCycleDrawMode = function (func) {
            if (_.isFunction(func)) {
                this.callbacks.cbDrawModeCycle.push(func);
            }
        };
        CursorService.prototype.CycleDrawMode = function () {
            this.drawModeIndex = (this.drawModeIndex + 1) % _.size(this.drawModes);
            var nextMode = this.drawModes[this.drawModeIndex];
            this.DrawMode.name = nextMode.name;
            this.DrawMode.mode = nextMode.mode;
            this.DrawMode.playback = nextMode.playback;
            this.DrawMode.cumulative = nextMode.cumulative;
            this.DrawMode.data = nextMode.data;
            _.forEach(this.callbacks.cbDrawModeCycle, function (func) {
                func();
            });
        };
        CursorService.prototype.UserMovedCursor = function ($event) {
            var self = this;
            if (self.cursorTimeout) {
                self.cursorTimeout = false;
                var cursorMove = {
                    pos: {
                        x: $event.clientX / this.$window.innerWidth,
                        y: $event.clientY / this.$window.innerHeight
                    },
                    t: self.frameDifference(self.ActivePageService.PageData.enterTime, new Date().getTime())
                };
                self.SocketService.CursorMove(cursorMove);
                /* Limits the cursor rate to (networkTiming)FPS */
                window.setTimeout(function () {
                    self.cursorTimeout = true;
                }, (1000 / self.networkTiming));
            }
        };
        CursorService.prototype.frameDifference = function (oldTime, newTime) {
            var difference = newTime - oldTime;
            return Math.ceil((difference / 1000) * this.networkTiming);
        };
        CursorService.name = 'CursorService';
        CursorService.FactoryDefinition = [
            '$window',
            'ActivePageService',
            'SocketService',
            function ($window, ActivePageService, SocketService) { return new CursorService($window, ActivePageService, SocketService); }
        ];
        return CursorService;
    })();
    return CursorService;
});
//# sourceMappingURL=CursorService.js.map