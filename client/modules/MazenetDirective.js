/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../typings/tsd.d.ts" />
define(["require", "exports", "./MazenetController"], function (require, exports, MazenetController) {
    function MazenetDirective() {
        var directive = {
            restrict: 'E',
            templateUrl: '/modules/MazenetTemplate.html',
            controller: MazenetController,
            controllerAs: 'mzCtrl',
            bindToController: true
        };
        return directive;
    }
    return MazenetDirective;
});
//# sourceMappingURL=MazenetDirective.js.map