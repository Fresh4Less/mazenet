/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../typings/index.d.ts" />

import ControlMenuController = require('./ControlMenuController');

export = ControlMenuDirective;

function ControlMenuDirective():ng.IDirective {
    var directive = <ng.IDirective> {
        restrict: 'E',
        templateUrl: '/modules/controlMenu/ControlMenuTemplate.html',
        transclude: true,
        controller: ControlMenuController,
        controllerAs: 'cmCtrl',
        bindToController: true
    };
    return directive;
}