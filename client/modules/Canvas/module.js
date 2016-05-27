/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../typings/tsd.d.ts" />
define(["require", "exports", './CanvasDirective'], function (require, exports, CanvasDirective) {
    return angular.module('mod.canvas', [])
        .directive('mzCanvas', CanvasDirective);
});
//# sourceMappingURL=module.js.map