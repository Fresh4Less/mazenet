function mazenetController($scope, SocketService, ActivePageService) {
	//Scope Variables
	$scope.pageId = '';
	$scope.page = ActivePageService.pageData;
	
	//Scope Functions
	$scope.loadPage = function() { 
		SocketService.LoadPage($scope.pageId).then(function(data) {
			console.log('Loaded Data', data);
			ActivePageService.UpdatePage(data);
		}, function(error) {
			console.error(error);
		});
	}
	
	$scope.doubleClick = function(event) {
		console.log("Double clicked!!", event);
	}
	
	//End Scope
};

angular.module('mazenet').controller('MazenetController', ['$scope', 'SocketService','ActivePageService', mazenetController]);