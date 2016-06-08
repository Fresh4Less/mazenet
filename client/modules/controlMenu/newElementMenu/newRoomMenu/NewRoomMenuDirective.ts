/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../../../typings/index.d.ts" />

import NewRoomMenuController = require('./NewRoomMenuController');

export = NewRoomMenuDirective;

function NewRoomMenuDirective():ng.IDirective {
    var directive = <ng.IDirective> {
        restrict: 'E',
        templateUrl: '/modules/controlMenu/newElementMenu/newRoomMenu/NewRoomMenuTemplate.html',
        controller: NewRoomMenuController,
        controllerAs: 'nrCtrl',
        bindToController: true
    };
    return directive;
}