/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../../typings/tsd.d.ts" />

import LinkElementDirective = require('./LinkElementDirective');

export = angular.module('mod.element.link', [])
.directive('mzLinkElement', LinkElementDirective);