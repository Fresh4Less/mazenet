/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../typings/index.d.ts" />

import WelcomeMenuDirective = require('./WelcomeMenuDirective');

export = angular.module('mod.controlmenu.welcomemenu', [])
    .directive('mzWelcomeMenu', WelcomeMenuDirective)