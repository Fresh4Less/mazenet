/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../../typings/tsd.d.ts" />
define(["require", "exports", './LinkElementController'], function (require, exports, LinkElementController) {
    function LinkElementDirective() {
        var directive = {
            restrict: 'E',
            scope: {
                element: '='
            },
            templateUrl: '/modules/Elements/Link/LinkElementTemplate.html',
            controller: LinkElementController,
            controllerAs: 'leCtrl',
            bindToController: true
        };
        return directive;
    }
    return LinkElementDirective;
});
//# sourceMappingURL=LinkElementDirective.js.map