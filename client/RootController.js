define(["require", "exports"], function (require, exports) {
    var RootController = (function () {
        function RootController($scope, $route, $routeParams, ActivePageService, SocketService) {
            this.$inject = [
                '$scope',
                '$route',
                '$routeParams',
                'ActivePageService',
                'SocketService'
            ];
            $scope['globalPageStyles'] = ActivePageService.styles;
            $scope.$on('$routeChangeSuccess', function () {
                if ($routeParams['pageId']) {
                    ActivePageService.RootPages.url = $routeParams['pageId'];
                }
                else {
                    ActivePageService.RootPages.url = '';
                }
            });
            SocketService.Init();
        }
        RootController.name = "RootController";
        return RootController;
    })();
    return RootController;
});
//# sourceMappingURL=RootController.js.map