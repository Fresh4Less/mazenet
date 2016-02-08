/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../typings/tsd.d.ts" />
define(["require", "exports", './BuildMenuDirective'], function (require, exports, BuildMenuDirective) {
    return angular.module('mod.buildmenu', [])
        .directive('mzBuildMenu', BuildMenuDirective);
});
//# sourceMappingURL=module.js.map