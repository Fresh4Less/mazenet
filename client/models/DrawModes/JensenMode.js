/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../typings/tsd.d.ts" />
define(["require", "exports"], function (require, exports) {
    var JensenMode = (function () {
        function JensenMode() {
            this.name = 'Peter Jensen';
            this.mode = 'sprite';
            this.playback = 'live';
            this.cumulative = false;
            this.data = {
                ready: false,
                sprite: new Image(),
                width: 37,
                height: 50,
            };
            this.data.sprite.src = "images/cursors/peter_jensen.png";
            this.data.sprite.onload = function () {
                this.data.ready = true;
            };
        }
        return JensenMode;
    })();
    return JensenMode;
});
//# sourceMappingURL=JensenMode.js.map