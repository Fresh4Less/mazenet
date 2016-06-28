/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../typings/index.d.ts" />
import mazenet = require('mazenet');

describe('Unit: RootController', ()=> {
    var $location:ng.ILocationService;
    var $route:ng.route.IRouteService;
    var $rootScope:ng.IRootScopeService;
    var $scope:ng.IScope;
    var $controller:ng.IControllerService;
    var RootController:any;


    beforeEach((done)=>{
        mazenet;
        module('mazenet'); //Just accept this error. It works.
        inject((_$location_:ng.ILocationService, _$route_:ng.route.IRouteService, _$rootScope_:ng.IRootScopeService  ,_$controller_:ng.IControllerService)=> {
            $location = _$location_;
            $route = _$route_;
            $rootScope = _$rootScope_;
            $scope = $rootScope.$new();
            $controller = _$controller_;
            RootController = $controller('RootController', {'$rootScope' : $rootScope, '$scope': $scope});
            done();
        });
    });
    it('should have RootController defined', ()=>{
        expect(RootController).toBeDefined();
    });
    it('should have the globalPageStyles defined', ()=>{
        expect($scope['globalPageStyles']).toBeDefined();
    });
    it('should map routes to the RootController', (done)=> {
        expect($route.routes['/room/:pageId'].controller).toBe('RootController');
        expect($route.routes['/room/:pageId'].templateUrl).toBe('index.html');
        expect($route.routes['/room'].controller).toBe('RootController');
        expect($route.routes['/room'].templateUrl).toBe('index.html');
        done();
    });
    //it('should update the routing stuff on change', (done) => {
    //    $location.path('room/1234567890');
    //    $rootScope.$apply();
    //    $rootScope.$broadcast('$routeChangeSuccess');
    //    console.log($scope['ActivePageService'].RootPages);
    //    fail();
    //    done();
    //});
});

