/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../typings/tsd.d.ts" />
define(["require", "exports"], function (require, exports) {
    var Sprite = (function () {
        function Sprite(options) {
            this.Render = function (x, y) {
                this.context.drawImage(this.image, 0, 0, this.width, this.height, x, y, this.width, this.height);
            };
            this.context = options.context;
            this.width = options.width;
            this.height = options.height;
            this.image = options.image;
        }
        return Sprite;
    })();
    return Sprite;
});
//# sourceMappingURL=Sprite.js.map