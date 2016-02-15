/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../../typings/tsd.d.ts" />

import NewRoomMenuController = require('./NewRoomMenuController');

export = NewRoomMenuDirective;

function NewRoomMenuDirective():ng.IDirective {
    var directive = <ng.IDirective> {
        restrict: 'E',
        templateUrl: '/modules/ControlMenu/NewRoomMenu/NewRoomMenuTemplate.html',
        controller: NewRoomMenuController,
        controllerAs: 'wmCtrl',
        bindToController: true
    };
    return directive;
}