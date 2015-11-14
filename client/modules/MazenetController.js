function mazenetController($scope, SocketService, ActivePageService) {
	//Scope Variables
	$scope.pageId = '563ff6d5ed248da731bcfae6';
	$scope.page = ActivePageService.pageData;
	
	//Scope Functions
	$scope.EnterPage = function(pId) { 
		var id = pId;
		if(!pId) {
			id = $scope.pageId
		}
		
		SocketService.EnterPage(id).then(function(data) {
			//Page entered
		}, function(error) {
			console.error('Error entering page:', id, error);
		});
	}
	
	//End Scope
};

angular.module('mazenet').controller('MazenetController', ['$scope', 'SocketService','ActivePageService', mazenetController]);