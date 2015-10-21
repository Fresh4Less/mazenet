angular.module('mazenet').controller('MazenetController', ['$scope', 'SocketService', MazenetController]);

function MazenetController($scope, SocketService) {
	$scope.testVar = "MazenetController loaded!";
	$scope.pageData = 'unloaded...';
	SocketService.Setup().then(function(data) {
		$scope.pageData = data;
	}, function(error) {
		$scope.pageData = error;
	});
};