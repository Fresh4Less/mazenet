/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../typings/tsd.d.ts" />
import WelcomeMenuModule = require('./WelcomeMenu/module');
import NewElementMenuModule = require('./NewElementMenu/module');
import RoomSettingsMenu = require('./RoomSettingsMenu/module');

import ControlMenuDirective = require('./ControlMenuDirective');

export = angular.module('mod.controlmenu', [
    WelcomeMenuModule.name,
        NewElementMenuModule.name,
    RoomSettingsMenu.name
])
    .directive('mzControlMenu', ControlMenuDirective)