/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../typings/tsd.d.ts" />
define(["require", "exports", "./RootController", './services/module', './modules/module'], function (require, exports, RootController, Services, Modules) {
    var mazenet = angular.module('mazenet', ['ui.bootstrap', 'ngRoute', Services.name, Modules.name]);
    mazenet.controller(RootController.name, RootController);
    mazenet.config(['$routeProvider', '$locationProvider',
        function ($routeProvider, $locationProvider) {
            $routeProvider
                .when('/room/:pageId', {
                templateUrl: 'index.html',
                controller: 'RootController'
            })
                .when('/room', {
                templateUrl: 'index.html',
                controller: 'RootController'
            })
                .otherwise({
                redirectTo: '/room'
            });
            //$locationProvider.html5Mode(true); TODO: make express work.
        }]);
    return mazenet;
});
//# sourceMappingURL=module.js.map