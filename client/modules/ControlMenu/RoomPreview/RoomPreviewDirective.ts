/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../../typings/index.d.ts" />

import RoomPreviewController = require('./RoomPreviewController');

export = RoomPreviewDirective;

function RoomPreviewDirective():ng.IDirective {
    var directive = <ng.IDirective> {
        restrict: 'E',
        scope: {
            previewRoom: '=',
            linkText: '='
        },
        templateUrl: '/modules/ControlMenu/RoomPreview/RoomPreviewTemplate.html',
        controller: RoomPreviewController,
        controllerAs: 'rpCtrl',
        bindToController: true
    };
    return directive;
}