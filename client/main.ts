/// <reference path="../typings/index.d.ts" />
declare var requirejs: any;

requirejs.config({
    paths : {
        'mazenet':'module',
        'socket.io': '/socket.io/socket.io',
        'angular': '/bower_components/angular/angular.min',
        'angular-route': '/bower_components/angular-route/angular-route.min',
        'angular-aria': '/bower_components/angular-aria/angular-aria.min',
        'angular-animate': '/bower_components/angular-animate/angular-animate.min',
        'angular-material': '/bower_components/angular-material/angular-material.min',
        'jquery':'/bower_components/jquery/dist/jquery.min',
        'underscore':'/bower_components/underscore/underscore-min',
    },
    shim: {
        'mazenet': {
            deps: ['angular', 'angular-route', 'angular-material', 'socket.io',  'underscore']
        },
        'angular-route': {
            deps: ['angular']
        },
        'angular-material': {
            deps: ['angular', 'angular-animate', 'angular-aria']
        },
        'angular-animate': {
            deps: ['angular']
        },
        'angular-aria': {
            deps: ['angular']
        },
        'socket.io': {
            exports: 'io'
        }
    }
});

requirejs(['mazenet'], function() {
    var ret = angular.bootstrap(document, ['mazenet']);
});