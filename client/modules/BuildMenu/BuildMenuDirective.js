/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../typings/tsd.d.ts" />
define(["require", "exports", './BuildMenuController'], function (require, exports, BuildMenuController) {
    function BuildMenuDirective() {
        var directive = {
            restrict: 'E',
            templateUrl: '/modules/BuildMenu/BuildMenuTemplate.html',
            controller: BuildMenuController,
            controllerAs: 'bmCtrl',
            bindToController: true
        };
        return directive;
    }
    return BuildMenuController;
});
//# sourceMappingURL=BuildMenuDirective.js.map