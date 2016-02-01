/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../typings/tsd.d.ts" />

export = ElementDirective;

function ElementDirective():ng.IDirective {
    var directive = <ng.IDirective>{
        restrict: 'E',
        scope: {
            element: '='
        },
        templateUrl: '/modules/Elements/ElementTemplate.html',
    };
    return directive;
}