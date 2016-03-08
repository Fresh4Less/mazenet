/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../typings/tsd.d.ts" />
import mazenet = require('mazenet');

import IControllerService = angular.IControllerService;

describe('Unit: RootController', ()=> {
    var $location:ng.ILocationService;
    var $rootScope:ng.IRootScopeService;
    var $scope:ng.IScope;
    var $controller:ng.IControllerService;
    var RootController:any;


    beforeEach(()=>{
        mazenet;
        module('mazenet'); //Just accept this error. It works.
        inject((_$location_:ng.ILocationService, _$rootScope_:ng.IRootScopeService  ,_$controller_:IControllerService)=> {
            $location = _$location_;
            $rootScope = _$rootScope_;
            $scope = $rootScope.$new();
            $controller = _$controller_;

            console.log('controller', $controller);
            RootController = $controller('RootController', {'$rootScope' : $rootScope, '$scope': $scope});
        });
    });
    it('should have RootController defined', ()=>{
        expect(RootController).toBeDefined();
    });
    it('should have the globalPageStyles defined', ()=>{
        expect($scope['globalPageStyles']).toBeDefined();
    });
    it('should update the route if the room changes', ()=>{
        $location.path('room/1234567890123456');
        console.log($scope['ActivePageService'].RootPages);
        fail();
    });

});

