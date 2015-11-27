var buildMenuController = function ($scope, SocketService, ActivePageService, ContextMenuService, UserService) {
	
	$scope.newLink = null;
	$scope.pageSettings = null;
	$scope.state = "root";
	
	$scope.backToRoot = function() {
		$scope.state = "root";
	}
	$scope.newRoomSelected = function() {
		$scope.state = "newRoom"
	}
	$scope.pageSettingsSelected = function() {
		$scope.state = "pageSettings"
	}
	$scope.newImageSelected = function() {
		$scope.state = "root";
	}
	$scope.createPage = function() {
		
		$scope.newLink.pos.x = ContextMenuService.position.x;
		$scope.newLink.pos.y = ContextMenuService.position.y;
		$scope.newLink.creator = UserService.UserData.uId;
		
		$scope.closeContextMenu();
		SocketService.CreateElement($scope.newLink);
	}
	
	$scope.updatePage = function() {
		SocketService.UpdatePage($scope.pageSettings);
	}
	
	$scope.closeContextMenu = function() {
		ContextMenuService.forceClose = true;
	}
	ContextMenuService.openCallback = function() {
		resetLocalData();
	}
	ContextMenuService.closeCallback = function() {
		$scope.state = 'root';
	}
	
	var resetLocalData = function() {
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
		$scope.pageSettings = {
			title: ActivePageService.PageData.title,
			permissions: ActivePageService.PageData.permissions,
			background: {
				bType : ActivePageService.PageData.background.bType,
				data : {
					color : ActivePageService.PageData.background.data.color
				}
			}
		}
	};
	
}
angular.module('mazenet').controller('BuildMenuController', ['$scope', 'SocketService','ActivePageService', 'ContextMenuService', 'UserService', buildMenuController]);