/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../typings/tsd.d.ts" />
import CursorService = require('./Cursors/module');

import SocketService = require('./SocketService');
import UserService = require('./UserService');

//import dep1 = require(./Pages/module);
export = angular.module('services', [
    CursorService.name])
    .factory(SocketService.name, SocketService)
    .factory(UserService.name, UserService);