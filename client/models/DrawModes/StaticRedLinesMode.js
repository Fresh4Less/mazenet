/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../typings/tsd.d.ts" />
define(["require", "exports"], function (require, exports) {
    var StaticRedLinesMode = (function () {
        function StaticRedLinesMode() {
            this.name = 'static red lines';
            this.mode = 'shape';
            this.playback = 'static';
            this.cumulative = true;
            this.data = {
                shape: 'line',
                size: 1,
                color: {
                    red: 255,
                    green: 50,
                    blue: 50,
                    alpha: 0.1
                }
            };
        }
        return StaticRedLinesMode;
    })();
    return StaticRedLinesMode;
});
//# sourceMappingURL=StaticRedLinesMode.js.map