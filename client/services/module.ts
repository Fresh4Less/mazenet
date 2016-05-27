/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../typings/tsd.d.ts" />
import CursorService = require('./cursors/module');
import PagesService = require('./pages/module');

import ClickNetService = require('./ClickNetService');
import SocketService = require('./SocketService');
import UserService = require('./UserService');
import ScreenPositioningService = require('./ScreenPositioningService');

//import dep1 = require(./Pages/module);
export = angular.module('services', [
    CursorService.name,
    PagesService.name
])
    .factory(SocketService.name, SocketService.FactoryDefinition)
    .factory(UserService.name, UserService.FactoryDefinition)
    .factory(ClickNetService.name, ClickNetService.FactoryDefinition)
    .factory(ScreenPositioningService.name, ScreenPositioningService.FactoryDefinition);