var buildMenuController = function ($scope, SocketService, ActivePageService, ContextMenuService) {
	
	$scope.newLink = {
		eType: "link",
		creator: "101010101010101010101010", //temp
		pos: {
			x: 0,
			y: 0
		},
		data: {
			text: "new room"
		}
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
		$scope.newLink.pos.x = ContextMenuService.position.x;
		$scope.newLink.pos.y = ContextMenuService.position.y;
		$scope.closeContextMenu();
		SocketService.CreateLink(ActivePageService.pageData._id, $scope.newLink).then(function(data) {
			console.log('link created', data);
			ActivePageService.AddElement(data.data);
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