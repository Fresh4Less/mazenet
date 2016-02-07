/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../typings/tsd.d.ts" />

import RootController = require("./RootController");
import Services = require('./services/module');
import Modules = require('./modules/module');

export = mazenet;

var mazenet = angular.module('mazenet', ['ui.bootstrap', 'ngRoute', Services.name, Modules.name]);

mazenet.controller(RootController.name, RootController);

mazenet.config(['$routeProvider', '$locationProvider',
    function($routeProvider, $locationProvider) {

        $routeProvider
            .when('/room/:pageId', {
                templateUrl: 'index.html',
                controller: 'RootController'
            })
            .when('/room', {
                templateUrl: 'index.html',
                controller: 'RootController'
            })
            .otherwise( {
                redirectTo:'/room'
            });

        //$locationProvider.html5Mode(true); TODO: make express work.
    }]
);