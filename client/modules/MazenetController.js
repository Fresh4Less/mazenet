angular.module('mazenet').controller('MazenetController', ['$scope', 'SocketService','PageService', MazenetController]);

function MazenetController($scope, SocketService, PageService) {
	$scope.testVar = "MazenetController loaded!";
	$scope.pageId = '56292c14f0565a484354cf8e';
	$scope.page = undefined;
	$scope.loadPage = function() {
		SocketService.LoadPage($scope.pageId).then(function(data) {
			console.log(data);
			$scope.page = data;
			PageService.SetColor(data.background.data.color);
		}, function(error) {
			console.error(error);
		});
	}
};