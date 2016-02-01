/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../../typings/tsd.d.ts" />
define(["require", "exports", './LinkElementDirective'], function (require, exports, LinkElementDirective) {
    return angular.module('mod.element.link', [])
        .directive('mzLinkElement', LinkElementDirective);
});
//# sourceMappingURL=module.js.map