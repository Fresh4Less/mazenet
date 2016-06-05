/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../../typings/tsd.d.ts" />

import InfoMenuController = require('./InfoMenuController');

export = InfoMenuDirective;

function InfoMenuDirective():ng.IDirective {
    var directive = <ng.IDirective> {
        restrict: 'E',
        templateUrl: '/modules/ControlMenu/InfoMenu/InfoMenuTemplate.html',
        controller: InfoMenuController,
        controllerAs: 'imCtrl',
        bindToController: true
    };
    return directive;
}