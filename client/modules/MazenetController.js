function mazenetController($scope, SocketService, ActivePageService) {
	//Scope Variables
	$scope.pageId = '5629b4171d18d8fd01c83513';
	$scope.page = ActivePageService.pageData;
	$scope.newPage = {
		hyperlinkName: 'New Page',
		title: 'Untitled',
		color: '#ffffff'
	};
	
	//Scope Functions
	$scope.loadPage = function() { 
		SocketService.LoadPage($scope.pageId).then(function(data) {
			console.log('Loaded Data', data);
			ActivePageService.UpdatePage(data);
		}, function(error) {
			console.error(error);
		});
	}
	$scope.createPage = function() {
		SocketService.CreatePage($scope.newPage).then(function(data) {
			console.log('Created Page Data', data);
			ActivePageService.UpdatePage(data.data);
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