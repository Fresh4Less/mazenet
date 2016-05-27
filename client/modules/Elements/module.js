/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../typings/tsd.d.ts" />
define(["require", "exports", './Link/module', './ElementDirective'], function (require, exports, LinkModule, ElementDirective) {
    return angular.module('mod.elements', [
        LinkModule.name
    ]).directive('mzElement', ElementDirective);
});
//# sourceMappingURL=module.js.map