/// <reference path="../typings/tsd.d.ts" />

requirejs.config({
    paths : {
        'app':'module',
        'socketio': '/socket.io/socket.io',
        'angular': 'angular/angular',
        'angular-route': '/angular-route/angular-route.min',
        'angular-bootstrap': '/angular-bootstrap/ui-bootstrap-tpls.min',
        'underscore':'/underscore.min'
    },
    shim: {
        'app': {
            deps: ['angular', 'socketio','underscore']
        },
        'angular': {
            deps: ['angular-route','angular-bootstrap']
        }
    }
});
requirejs(['app'], function() {
    angular.bootstrap(document, ['app']);
});