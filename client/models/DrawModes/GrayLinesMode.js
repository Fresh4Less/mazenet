/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../typings/tsd.d.ts" />
define(["require", "exports"], function (require, exports) {
    var GrayLinesMode = (function () {
        function GrayLinesMode() {
            this.name = 'gray lines';
            this.mode = 'shape';
            this.playback = 'live';
            this.cumulative = true;
            this.data = {
                shape: 'line',
                size: 6,
                color: {
                    red: 50,
                    green: 50,
                    blue: 50,
                    alpha: 0.2
                }
            };
        }
        return GrayLinesMode;
    })();
    return GrayLinesMode;
});
//# sourceMappingURL=GrayLinesMode.js.map