/// <reference path="../typings/tsd.d.ts" />

requirejs.config({
    paths : {
        'mazenet':'module',
        'socketio': '/socket.io/socket.io',
        'angular': '/bower_components/angular/angular',
        'angular-route': '/bower_components/angular-route/angular-route',
        'angular-aria': '/bower_components/angular-aria/angular-aria',
        'angular-animate': '/bower_components/angular-animate/angular-animate',
        'angular-material': '/bower_components/angular-material/angular-material',
        'jquery':'/bower_components/jquery/dist/jquery',
        'underscore':'/bower_components/underscore/underscore-min',
    },
    shim: {
        'mazenet': {
            deps: ['angular', 'angular-route', 'angular-material', 'socketio',  'underscore']
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
        }
    }
});

requirejs(['mazenet'], function() {
    var ret = angular.bootstrap(document, ['mazenet']);
});