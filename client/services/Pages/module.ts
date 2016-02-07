/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../typings/tsd.d.ts" />
import ActivePageService = require('./ActivePageService');

export = angular.module('pages',[])
    .factory(ActivePageService.name, ActivePageService.FactoryDefinition);