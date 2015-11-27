var app = angular.module('mazenet', ['ui.bootstrap', 'ngRoute', 'ng-context-menu']);

var rootController = function($scope, $route, $routeParams, ActivePageService, SocketService) {
	$scope.globalPageStyles = ActivePageService.styles;
	$scope.$on('$routeChangeSuccess', function() {
		if($routeParams.pageId) {
			ActivePageService.RootPages.url = $routeParams.pageId
		} else {
			ActivePageService.RootPages.url = '';
		}
  	});
	SocketService.Init();
};

app.controller('RootController', 
				['$scope', '$route', '$routeParams', 'ActivePageService', 'SocketService', rootController]);
				
app.config(['$routeProvider', '$locationProvider', 
	function($routeProvider, $locationProvider) {
		
		$routeProvider
			.when('/', {
				templateUrl: 'index.html',
				controller: 'RootController'
			})
			.when('/room/:pageId', {
				templateUrl: 'index.html',
				controller: 'RootController'
			})
			.otherwise( {
				redirectTo:'/room'
			});
			
		//$locationProvider.html5Mode(true); TODO: make express work.
}]);