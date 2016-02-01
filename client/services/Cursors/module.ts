/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../typings/tsd.d.ts" />
import CursorService = require('./CursorService');

export = angular.module('cursors', [])
    .factory(CursorService.name, CursorService);