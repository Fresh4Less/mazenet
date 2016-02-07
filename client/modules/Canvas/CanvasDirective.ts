/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../typings/tsd.d.ts" />
import CanvasController = require('./CanvasController')

export = CanvasDirective;

function CanvasDirective():ng.IDirective {
    var directive = <ng.IDirective> {
        restrict: 'E',
        templateUrl: '/modules/Canvas/CanvasTemplate.html',
        controller: CanvasController,
        controllerAs: 'cvCtrl',
        bindToController:true,
    };

    return directive;
}