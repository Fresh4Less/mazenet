function mazenetController($scope, SocketService, ActivePageService) {
	//Scope Variables
	$scope.pageId = '563ff6d5ed248da731bcfae6';
	$scope.page = ActivePageService.pageData;
	
	//Scope Functions
	$scope.loadPage = function(pId) { 
		var id = pId;
		if(!pId) {
			id = $scope.pageId
		}
		
		SocketService.LoadPage(id).then(function(data) {
			console.log('Loaded Data', data);
			ActivePageService.UpdatePage(data);
		}, function(error) {
			console.error(error);
		});
	}
	
	//End Scope
};

angular.module('mazenet').controller('MazenetController', ['$scope', 'SocketService','ActivePageService', mazenetController]);