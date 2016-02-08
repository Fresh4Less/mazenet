/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../typings/tsd.d.ts" />
import MazenetDirective = require('./MazenetDirective');
import CanvasModule = require('./Canvas/module');
import ElementsModule = require('./Elements/module');
import ControlMenuModule = require('./ControlMenu/module');

export = angular.module('modules', [
    CanvasModule.name,
    ElementsModule.name,
    ControlMenuModule.name
]).directive("mzMazenet", MazenetDirective);