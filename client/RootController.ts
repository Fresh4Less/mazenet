/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../typings/index.d.ts" />
import ISocketService = require('./services/interfaces/ISocketService');

export = RootController;

class RootController {

    static moduleName:string = "RootController";

    static $inject = [
        '$scope',
        '$route',
        '$routeParams',
        'ActivePageService',
        'SocketService'
    ];
    constructor($scope:ng.IScope,
                $route:ng.route.IRouteProvider,
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