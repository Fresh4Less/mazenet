/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../typings/index.d.ts" />
import NewElementMenuModule = require('./NewElementMenu/module');
import InfoMenuModule = require('./InfoMenu/module');
import RoomSettingsMenuModule = require('./RoomSettingsMenu/module');
import UserMenuModule = require('./UserMenu/module');
import RoomPreviewModule = require('./RoomPreview/module')
import BackgroundSettingsModule = require('./BackgroundSettings/module')
import PermissionSettingsModule = require('./PermissionSettings/module')

import ControlMenuDirective = require('./ControlMenuDirective');

export = angular.module('mod.controlmenu', [
    NewElementMenuModule.name,
    RoomSettingsMenuModule.name,
    InfoMenuModule.name,
    UserMenuModule.name,
    RoomPreviewModule.name,
    BackgroundSettingsModule.name,
    PermissionSettingsModule.name
])
    .directive('mzControlMenu', ControlMenuDirective)