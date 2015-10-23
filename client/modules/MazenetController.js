angular.module('mazenet').controller('MazenetController', ['$scope', 'SocketService','PageService', MazenetController]);

function MazenetController($scope, SocketService, PageService) {
	$scope.testVar = "MazenetController loaded!";
	$scope.pageId = '5629b4171d18d8fd01c83513';
	$scope.page = undefined;
	$scope.newPageColor = '';
	$scope.loadPage = function() {
		SocketService.LoadPage($scope.pageId).then(function(data) {
			console.log(data);
			$scope.page = data;
			PageService.SetColor(data.background.data.color);
		}, function(error) {
			console.error(error);
		});
	}
	$scope.createPage = function() {
		SocketService.CreatePage($scope.newPageColor).then(function(data) {
			$scope.page = data;
			PageService.SetColor(data.background.data.color);
		}, function(error) {
			console.error(error);
		});
	}
};