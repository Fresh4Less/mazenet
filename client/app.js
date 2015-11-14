var app = angular.module('mazenet', ['ui.bootstrap', 'ngRoute', 'ng-context-menu']);

var rootController = function($scope, ActivePageService, SocketService) {
	$scope.globalPageStyles = ActivePageService.styles;
	SocketService.Init();
};

app.controller('RootController', 
				['$scope' , 'ActivePageService', 'SocketService', rootController]);