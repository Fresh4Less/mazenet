/// <reference path="../typings/tsd.d.ts" />

requirejs.config({
    paths : {
        'mazenet':'module',
        'socketio': '/socket.io/socket.io',
        'angular': '/bower_components/angular/angular',
        'angular-route': '/bower_components/angular-route/angular-route.min',
        'angular-bootstrap': '/bower_components/angular-bootstrap/ui-bootstrap-tpls.min',
        'underscore':'/bower_components/underscore/underscore-min'
    },
    shim: {
        'mazenet': {
            deps: ['angular', 'angular-route', 'angular-bootstrap', 'socketio', 'underscore']
        },
        'angular-route': {
            deps: ['angular']
        },
        'angular-bootstrap': {
            deps: ['angular']
        }
    }
});

requirejs(['mazenet'], function() {
    var ret = angular.bootstrap(document, ['mazenet']);
});