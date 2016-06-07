/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../../typings/index.d.ts" />

import RoomPreviewDirective = require('./RoomPreviewDirective');

export = angular.module('mod.controlmenu.roompreview',[])
    .directive('mzRoomPreview', RoomPreviewDirective);