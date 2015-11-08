var buildMenuController = function ($scope, SocketService, ActivePageService, ContextMenuService) {
	
	$scope.newPage = {
		hyperlinkName: 'New Page',
		title: 'Untitled',
		color: '#ffffff'
	};
	$scope.state = "root";
	$scope.backToRoot = function() {
		$scope.state = "root";
	}
	$scope.newRoomSelected = function() {
		$scope.state = "newRoom"
	}
	$scope.newImageSelected = function() {
		$scope.state = "root";
	}
	$scope.createPage = function() {
		$scope.closeContextMenu();
		SocketService.CreatePage($scope.newPage).then(function(data) {
			ActivePageService.UpdatePage(data.data);
		}, function(error) {
			console.error(error);
		});
	}
	
	$scope.closeContextMenu = function() {
		ContextMenuService.forceClose = true;
	}
	
	ContextMenuService.closeCallback = function() {
		$scope.state = 'root';
	}
	
}
angular.module('mazenet').controller('BuildMenuController', ['$scope', 'SocketService','ActivePageService', 'ContextMenuService', buildMenuController]);