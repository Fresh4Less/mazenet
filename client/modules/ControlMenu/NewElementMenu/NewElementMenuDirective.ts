/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../../typings/tsd.d.ts" />

import NewElementMenuController = require('./NewElementMenuController');

export = NewElementMenuDirective;

function NewElementMenuDirective():ng.IDirective {
    var directive = <ng.IDirective> {
        restrict: 'E',
        templateUrl: '/modules/ControlMenu/NewElementMenu/NewElementMenuTemplate.html',
        controller: NewElementMenuController,
        controllerAs: 'neCtrl',
        bindToController: true
    };
    return directive;
}