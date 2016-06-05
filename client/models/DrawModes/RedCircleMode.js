/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../typings/tsd.d.ts" />
define(["require", "exports"], function (require, exports) {
    var RedCircleMode = (function () {
        function RedCircleMode() {
            this.name = 'red circles';
            this.mode = 'shape';
            this.playback = 'live';
            this.cumulative = true;
            this.data = {
                shape: 'circle',
                size: 20,
                color: {
                    red: 255,
                    green: 50,
                    blue: 50,
                    alpha: 0.1
                }
            };
        }
        return RedCircleMode;
    })();
    return RedCircleMode;
});
//# sourceMappingURL=RedCircleMode.js.map