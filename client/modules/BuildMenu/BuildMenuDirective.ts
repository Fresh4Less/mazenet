/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../typings/tsd.d.ts" />

import BuildMenuController = require('./BuildMenuController');

export = BuildMenuController;

function BuildMenuDirective():ng.IDirective {
    var directive = <ng.IDirective> {
        restrict: 'E',
        templateUrl: '/modules/BuildMenu/BuildMenuTemplate.html',
        controller: BuildMenuController,
        controllerAs: 'bmCtrl',
        bindToController: true
    };
    return directive;
}