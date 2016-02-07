/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../typings/tsd.d.ts" />
import MazenetDirective = require('./MazenetDirective');
import CanvasModule = require('./Canvas/module');
import ElementsModule = require('./Elements/module');
import BuildMenuModule = require('./BuildMenu/module');
import ngContextMenu = require('./ng-context-menu');

export = angular.module('modules', [
    CanvasModule.name,
    ElementsModule.name,
    BuildMenuModule.name,
    ngContextMenu.name
]).directive("mzMazenet", MazenetDirective);