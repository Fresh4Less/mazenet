/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../../typings/index.d.ts" />

import BackgroundSettingsDirective = require('./BackgroundSettingsDirective');

export = angular.module('mod.controlmenu.backgroundsettings', [])
    .directive('mzBackgroundSettings', BackgroundSettingsDirective);