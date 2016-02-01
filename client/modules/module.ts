/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../typings/tsd.d.ts" />
import MazenetDirective = require('./MazenetDirective');
import CanvasModule = require('./Canvas/module');
import ElementsModule = require('./Elements/module');
import BuildMenuModule = require('./BuildMenu/module');

export = angular.module('modules', [
    CanvasModule.name,
    ElementsModule.name,
    BuildMenuModule.name
]).directive("mzMazenet", MazenetDirective);