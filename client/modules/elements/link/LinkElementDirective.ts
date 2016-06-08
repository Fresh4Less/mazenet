/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../../typings/index.d.ts" />

import LinkElementController = require('./LinkElementController');

export = LinkElementDirective;

function LinkElementDirective():ng.IDirective {
    var directive = <ng.IDirective> {
        restrict: 'E',
        scope: {
            element: '='
        },
        templateUrl: '/modules/Elements/Link/LinkElementTemplate.html',
        controller: LinkElementController,
        controllerAs: 'leCtrl',
        bindToController: true
    }

    return directive;
}