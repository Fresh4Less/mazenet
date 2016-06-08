/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../typings/index.d.ts" />
import MazenetDirective = require('./MazenetDirective');
import CanvasModule = require('./canvas/module');
import ElementsModule = require('./elements/module');
import ControlMenuModule = require('./controlMenu/module');
import ClickNetModule = require('./clickNet/module');

export = angular.module('modules', [
    CanvasModule.name,
    ElementsModule.name,
    ControlMenuModule.name,
    ClickNetModule.name
]).directive("mzMazenet", MazenetDirective);