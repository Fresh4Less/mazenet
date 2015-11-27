var buildMenuController = function ($scope, SocketService, ActivePageService, ContextMenuService, UserService) {
	
	$scope.newLink = {
		eType: "link",
		creator: "unset",
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
		$scope.newLink.creator = UserService.UserData.uId;
		
		$scope.closeContextMenu();
		SocketService.CreateElement($scope.newLink)
		.then(function(element) {
			/* Element Created */
		}, function(error) {
			console.error("Error Creating Page:" , error);
		});
	}
	
	$scope.closeContextMenu = function() {
		ContextMenuService.forceClose = true;
	}
	
	ContextMenuService.closeCallback = function() {
		$scope.state = 'root';
	}
	
}
angular.module('mazenet').controller('BuildMenuController', ['$scope', 'SocketService','ActivePageService', 'ContextMenuService', 'UserService', buildMenuController]);