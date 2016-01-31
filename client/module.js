/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../typings/tsd.d.ts" />
define(["require", "exports", "./RootController", './services/module'], function (require, exports, RootController, Services) {
    var app = angular.module('mazenet', ['ui.bootstrap', 'ngRoute', 'ng-context-menu', Services.name]);
    app.controller(RootController.name, RootController);
    app.config(['$routeProvider', '$locationProvider',
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
});
//# sourceMappingURL=module.js.map