/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../typings/tsd.d.ts" />
import NewElementMenuModule = require('./NewElementMenu/module');
import InfoMenuModule = require('./InfoMenu/module');
import RoomSettingsModule = require('./RoomSettingsMenu/module');

import ControlMenuDirective = require('./ControlMenuDirective');

export = angular.module('mod.controlmenu', [
    NewElementMenuModule.name,
        RoomSettingsModule.name,
        InfoMenuModule.name
])
    .directive('mzControlMenu', ControlMenuDirective)