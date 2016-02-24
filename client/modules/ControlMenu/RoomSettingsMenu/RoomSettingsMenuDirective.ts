/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../../typings/tsd.d.ts" />

import RoomSettingsMenuController = require("./RoomSettingsMenuController");

export = RoomSettingsMenuDirective;

function RoomSettingsMenuDirective():ng.IDirective {
    var directive = <ng.IDirective> {
        restrict: 'E',
        templateUrl: '/modules/ControlMenu/RoomSettingsMenu/RoomSettingsMenuTemplate.html',
        controller: RoomSettingsMenuController,
        controllerAs: 'rsCtrl',
        bindToController: true
    };
    return directive;
}