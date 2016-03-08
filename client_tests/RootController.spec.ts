/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../typings/tsd.d.ts" />
import mazenet = require('mazenet');
import IControllerService = angular.IControllerService;
//import mazenet = require('./module');

describe('Unit: RootController', ()=> {
    var $rootScope:ng.IRootScopeService;
    var $scope:ng.IScope;
    var $controller:ng.IControllerService;
    var RootController:any;


    beforeEach(()=>{
        mazenet;
        module('mazenet'); //Just accept this error. It works.
        inject((_$rootScope_:ng.IRootScopeService  ,_$controller_:IControllerService)=> {
            $rootScope = _$rootScope_;
            $scope = $rootScope.$new();
            $controller = _$controller_;

            console.log('controller', $controller);
            RootController = $controller('RootController', {'$rootScope' : $rootScope, '$scope': $scope});
        });
    });
    it('should have a RootController', ()=> {
        expect(RootController).toBeDefined();
    });
});

