/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../typings/index.d.ts" />
import NewElementMenuModule = require('./newElementMenu/module');
import InfoMenuModule = require('./infoMenu/module');
import RoomSettingsMenuModule = require('./roomSettingsMenu/module');
import UserMenuModule = require('./userMenu/module');
import RoomPreviewModule = require('./roomPreview/module');
import PermissionSettingsModule = require('./permissionSettings/module');

import ControlMenuDirective = require('./ControlMenuDirective');

export = angular.module('mod.controlmenu', [
    NewElementMenuModule.name,
    RoomSettingsMenuModule.name,
    InfoMenuModule.name,
    UserMenuModule.name,
    RoomPreviewModule.name,
    PermissionSettingsModule.name
])
    .directive('mzControlMenu', ControlMenuDirective)