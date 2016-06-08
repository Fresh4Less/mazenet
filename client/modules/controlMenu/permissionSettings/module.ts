/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../../typings/index.d.ts" />

import PermissionSettingsDirective = require('./PermissionSettingsDirective');

export = angular.module('mod.controlmenu.permissionsettings',[])
    .directive('mzPermissionSettings', PermissionSettingsDirective)