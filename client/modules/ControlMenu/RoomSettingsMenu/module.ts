/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../../typings/tsd.d.ts" />

import RoomSettingsMenuDirective = require('./RoomSettingsMenuDirective');

export = angular.module('mod.controlmenu.roomsettingsmenu', [])
    .directive('mzRoomSettingsMenu', RoomSettingsMenuDirective)