/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../typings/index.d.ts" />

export = ElementDirective;

function ElementDirective():ng.IDirective {
    var directive = <ng.IDirective>{
        restrict: 'E',
        scope: {
            element: '='
        },
        templateUrl: '/modules/elements/ElementTemplate.html',
    };
    return directive;
}