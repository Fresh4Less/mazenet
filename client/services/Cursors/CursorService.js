/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../typings/tsd.d.ts" />
define(["require", "exports", '../../models/DrawModes/CursorDrawMode', '../../models/DrawModes/GrayLinesMode', '../../models/DrawModes/RedCircleMode', '../../models/DrawModes/StaticRedLinesMode', '../../models/DrawModes/JensenMode'], function (require, exports, CursorDrawMode, GrayLinesMode, RedCircleMode, StaticRedLinesMode, JensenMode) {
    var CursorService = (function () {
        function CursorService() {
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
            this.$inject = [];
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
        CursorService.name = 'CursorService';
        return CursorService;
    })();
    return CursorService;
});
//# sourceMappingURL=CursorService.js.map