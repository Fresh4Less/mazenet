/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../../typings/index.d.ts" />

import InfoMenuDirective = require('./InfoMenuDirective');

export = angular.module('mod.controlmenu.infomenudirective', [])
    .directive('mzInfoMenu', InfoMenuDirective);