/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../../typings/index.d.ts" />

import UserMenuDirective = require('./UserMenuDirective');

export = angular.module('mod.controlmenu.usermenu', [])
    .directive('mzUserMenu', UserMenuDirective);