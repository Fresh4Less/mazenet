/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../typings/tsd.d.ts" />
define(["require", "exports"], function (require, exports) {
    function ElementDirective() {
        var directive = {
            restrict: 'E',
            scope: {
                element: '='
            },
            templateUrl: '/modules/Elements/ElementTemplate.html',
        };
        return directive;
    }
    return ElementDirective;
});
//# sourceMappingURL=ElementDirective.js.map