/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../typings/tsd.d.ts" />
define(["require", "exports"], function (require, exports) {
    function CanvasDirective() {
        var directive = {
            restrict: 'E',
            templateUrl: '/modules/Canvas/CanvasTemplate.html',
            scope: {
                target: '@',
            },
            controller: 'CanvasController',
            controllerAs: 'cvCtrl',
            bindToController: true,
            replace: true
        };
        return directive;
    }
    return CanvasDirective;
});
//# sourceMappingURL=CanvasDirective.js.map