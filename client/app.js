var app = angular.module('mazenet', ['ngRoute', 'ng-context-menu']);

var rootController = function($scope, ActivePageService) {
	$scope.globalPageStyles = ActivePageService.styles;
};

app.controller('RootController', ['$scope' , 'ActivePageService', rootController]);