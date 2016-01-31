/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../typings/tsd.d.ts" />

import RootController = require("./RootController");
import Services = require('./services/module');

var app = angular.module('mazenet', ['ui.bootstrap', 'ngRoute', 'ng-context-menu', Services.name]);
app.controller(RootController.name, RootController);

app.config(['$routeProvider', '$locationProvider',
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