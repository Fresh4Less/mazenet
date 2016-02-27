/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../../typings/tsd.d.ts" />

import NewRooomMenuModule = require('./NewRoomMenu/module');
import NewElementMenuDirective = require('./NewElementMenuDirective');

export = angular.module('mod.controlmenu.newelementmenu', [NewRooomMenuModule.name])
    .directive('mzNewElementMenu', NewElementMenuDirective)