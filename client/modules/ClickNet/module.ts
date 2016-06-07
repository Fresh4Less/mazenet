/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../typings/index.d.ts" />
import ClickNetDirective = require('./ClickNetDirective');

export = angular.module('mod.clicknet', [])
    .directive('mzClickNet', ClickNetDirective);