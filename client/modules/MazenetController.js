function MazenetController($scope, SocketService, PageService) {
	//Scope Variables
	$scope.testVar = "MazenetController loaded!";
	$scope.pageId = '5629b4171d18d8fd01c83513';
	$scope.page = PageService.pageData;
	$scope.newPage = {
		hyperlinkName: 'New Page',
		title: 'Untitled',
		color: '#ffffff'
	};
	
	//Scope Functions
	$scope.loadPage = function() {
		SocketService.LoadPage($scope.pageId).then(function(data) {
			console.log('Loaded Data', data);
			PageService.UpdatePage(data);
		}, function(error) {
			console.error(error);
		});
	}
	$scope.createPage = function() {
		SocketService.CreatePage($scope.newPageColor).then(function(data) {
			console.log('Created Page Data', data);
			PageService.UpdatePage(data.data);
		}, function(error) {
			console.error(error);
		});
	}
	
	//End Scope
};

angular.module('mazenet').controller('MazenetController', ['$scope', 'SocketService','ActivePageService', MazenetController]);