/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../typings/tsd.d.ts" />
import ISocketService = require('./services/Interfaces/ISocketService');

export = RootController;

class RootController {
   static name:string = "RootController";

    $inject = [
        '$scope',
        '$route',
        '$routeParams',
        'ActivePageService',
        'SocketService'
    ];
    constructor($scope:ng.IScope,
                $route:ng.route.IRoute,
                $routeParams:ng.route.IRouteParamsService,
                ActivePageService:any,
                SocketService:ISocketService) {
        $scope['globalPageStyles'] = ActivePageService.Styles;
        $scope['ActivePageService'] = ActivePageService;
        $scope.$on('$routeChangeSuccess', function() {
            if($routeParams['pageId']) {
                ActivePageService.RootPages.url = $routeParams['pageId'];
            } else {
                ActivePageService.RootPages.url = '';
            }
        });
        SocketService.Init();
    }
}