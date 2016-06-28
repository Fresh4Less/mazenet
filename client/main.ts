/// <reference path="../typings/index.d.ts" />
declare var requirejs: any;

requirejs.config({
    paths : {
        'mazenet':'module',
    },
    shim: {
    }
});

requirejs(['mazenet'], function() {
    var ret = angular.bootstrap(document, ['mazenet']);
});