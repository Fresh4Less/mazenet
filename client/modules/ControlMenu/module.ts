/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../typings/tsd.d.ts" />

import ControlMenuDirective = require('./ControlMenuDirective');

export = angular.module('mod.controlmenu', [])
    .directive('mzControlMenu', ControlMenuDirective)