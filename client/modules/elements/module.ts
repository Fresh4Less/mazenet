/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../typings/index.d.ts" />

import LinkModule = require('./Link/module');
import ElementDirective = require('./ElementDirective');

export = angular.module('mod.elements', [
    LinkModule.name
]).directive('mzElement', ElementDirective);