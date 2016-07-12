/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../../typings/index.d.ts" />

import RoomPreviewController = require('./RoomPreviewController');

export = RoomPreviewDirective;

function RoomPreviewDirective():ng.IDirective {
    var directive = <ng.IDirective> {
        restrict: 'E',
        scope: {
            previewRoom: '='
        },
        templateUrl: '/modules/controlMenu/roomPreview/RoomPreviewTemplate.html',
        controller: RoomPreviewController,
        controllerAs: 'rpCtrl',
        bindToController: true
    };
    return directive;
}