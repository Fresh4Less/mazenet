/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../typings/tsd.d.ts" />
define(["require", "exports"], function (require, exports) {
    var CursorDrawMode = (function () {
        function CursorDrawMode() {
            this.name = 'live cursors';
            this.mode = 'sprite';
            this.playback = 'live';
            this.cumulative = false;
            this.data = {
                ready: false,
                sprite: new Image(),
                width: 25,
                height: 25,
            };
            this.data.sprite.src = "images/cursors/cursor.png";
            this.data.sprite.onload = function () {
                this.data.ready = true;
            };
        }
        return CursorDrawMode;
    })();
    return CursorDrawMode;
});
//# sourceMappingURL=CursorDrawMode.js.map