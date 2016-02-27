/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../../typings/tsd.d.ts" />

import InfoMenuDirective = require('./InfoMenuDirective');

export = angular.module('mod.controlmenu.infomenudirective', [])
    .directive('mzInfoMenu', InfoMenuDirective);