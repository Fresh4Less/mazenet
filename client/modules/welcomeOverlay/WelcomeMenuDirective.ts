/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../typings/index.d.ts" />
import WelcomeMenuController = require('./WelcomeMenuController');

export = WelcomeMenuDirective

function WelcomeMenuDirective():ng.IDirective {
    var directive = <ng.IDirective> {
        restrict: 'E',
        templateUrl: '/modules/WelcomeOverlay/WelcomeMenuTemplate.html',
        controller: WelcomeMenuController,
        controllerAs: 'wmCtrl',
        bindToController: true
    };
    return directive;
}