/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../typings/tsd.d.ts" />

import MazenetController = require("./MazenetController");

export = MazenetDirective;

function MazenetDirective():ng.IDirective {
    var directive = <ng.IDirective> {
        restrict: 'E',
        templateUrl: '/modules/MazenetTemplate.html',
        controller: MazenetController,
        controllerAs: 'mzCtrl',
        bindToController: true
    };
    return directive;
}