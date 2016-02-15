/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../typings/tsd.d.ts" />
import WelcomeMenuModule = require('./WelcomeMenu/module');
import NewRoomMenuModule = require('./NewRoomMenu/module');

import ControlMenuDirective = require('./ControlMenuDirective');

export = angular.module('mod.controlmenu', [
    WelcomeMenuModule.name,
    NewRoomMenuModule.name
])
    .directive('mzControlMenu', ControlMenuDirective)