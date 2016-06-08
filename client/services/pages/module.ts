/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../typings/index.d.ts" />
import ActivePageService = require('./ActivePageService');

export = angular.module('pages',[])
    .factory(ActivePageService.moduleName, ActivePageService.FactoryDefinition);