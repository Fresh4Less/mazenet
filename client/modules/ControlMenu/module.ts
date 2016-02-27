/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../typings/tsd.d.ts" />
import NewElementMenuModule = require('./NewElementMenu/module');
import InfoMenuModule = require('./InfoMenu/module');
import RoomSettingsMenuModule = require('./RoomSettingsMenu/module');
import UserMenuModule = require('./UserMenu/module');

import ControlMenuDirective = require('./ControlMenuDirective');

export = angular.module('mod.controlmenu', [
    NewElementMenuModule.name,
        RoomSettingsMenuModule.name,
        InfoMenuModule.name,
        UserMenuModule.name
])
    .directive('mzControlMenu', ControlMenuDirective)