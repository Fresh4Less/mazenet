/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../typings/index.d.ts" />
import CursorService = require('./CursorService');

export = angular.module('cursors', [])
    .factory(CursorService.moduleName, CursorService.FactoryDefinition);