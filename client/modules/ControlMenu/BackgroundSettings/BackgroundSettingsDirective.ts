/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../../typings/index.d.ts" />

import BackgroundSettingsController = require('./BackgroundSettingsController');

export = BackgroundSettingsDirective;

function BackgroundSettingsDirective():ng.IDirective {
    var directive = <ng.IDirective> {
        restrict: 'E',
        scope: {
            backgroundModel: '='
        },
        templateUrl: '/modules/ControlMenu/BackgroundSettings/BackgroundSettingsTemplate.html',
        controller: BackgroundSettingsController,
        controllerAs: 'bsCtrl',
        bindToController: true
    };
    return directive;
}