/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../typings/tsd.d.ts" />

export = CanvasDirective;

function CanvasDirective():ng.IDirective {
    var directive = <ng.IDirective> {
        restrict: 'E',
        templateUrl: '/modules/Canvas/CanvasTemplate.html',
        scope : {
            target: '@',
        },
        controller: 'CanvasController',
        controllerAs: 'cvCtrl',
        bindToController:true,
        replace: true
    };

    return directive;
}