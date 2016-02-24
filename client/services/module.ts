/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../typings/tsd.d.ts" />
import CursorService = require('./Cursors/module');
import PagesService = require('./Pages/module');

import ClickNetService = require('./ClickNetService');
import SocketService = require('./SocketService');
import UserService = require('./UserService');
import MenuService = require('./MenuService');

//import dep1 = require(./Pages/module);
export = angular.module('services', [
    CursorService.name,
    PagesService.name
])
    .factory(SocketService.name, SocketService.FactoryDefinition)
    .factory(UserService.name, UserService.FactoryDefinition)
    .factory(MenuService.name, MenuService.FactoryDefinition)
    .factory(ClickNetService.name, ClickNetService.FactoryDefinition);