/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../../typings/index.d.ts" />

import InfoMenuController = require('./InfoMenuController');

export = InfoMenuDirective;

function InfoMenuDirective():angular.IDirective {
    var directive = <angular.IDirective> {
        restrict: 'E',
        templateUrl: '/modules/ControlMenu/InfoMenu/InfoMenuTemplate.html',
        controller: InfoMenuController,
        controllerAs: 'imCtrl',
        bindToController: true
    };
    return directive;
}