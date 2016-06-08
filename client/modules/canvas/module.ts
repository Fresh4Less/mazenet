/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../typings/index.d.ts" />

import CanvasDirective = require('./canvasDirective');

export = angular.module('mod.canvas', [])
    .directive('mzCanvas', CanvasDirective);