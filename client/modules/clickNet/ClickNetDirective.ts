/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../typings/index.d.ts" />

import ClickNetController = require("./ClickNetController");

export = ClickNetDirective;

function ClickNetDirective():ng.IDirective {
    var directive = <ng.IDirective>{
        restrict: 'E',
        templateUrl: '/modules/clickNet/ClickNetTemplate.html',
        controller: ClickNetController,
        controllerAs: 'cnCtrl',
        bindToController: true
    };
    return directive;
}