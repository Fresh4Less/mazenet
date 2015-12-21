var buildMenuController = function ($scope, SocketService, ActivePageService, ContextMenuService, UserService, CursorService) {
	
	$scope.isOpen = false;
    $scope.cursorService = CursorService;
	$scope.tunnelingInfo = {
		isTunneling : false,
		text: 'NEW_LINK',
		pos: {
			x: -1,
			y: -1
		}
	};
	$scope.newLink = {
		eType: "link",
		creator: "unset",
		pos: {
			x: 0,
			y: 0
		},
		data: {
			text: ""
		}
	};
	$scope.pageSettings = null;
	$scope.state = "root";
	
	$scope.backToRoot = function() {
		$scope.state = "root";
	};
	$scope.newRoomSelected = function() {
		$scope.state = "newRoom";
	};
	$scope.pageSettingsSelected = function() {
		$scope.state = "pageSettings";
	};
	$scope.newImageSelected = function() {
		$scope.state = "root";
	};
	$scope.createPage = function() {
		
		$scope.newLink.pos.x = ContextMenuService.position.x;
		$scope.newLink.pos.y = ContextMenuService.position.y;
		$scope.newLink.creator = UserService.UserData.uId;
		
		$scope.closeContextMenu();
		$scope.tunnelingInfo.isTunneling = true;
		$scope.tunnelingInfo.pos.x = ContextMenuService.position.x;
		$scope.tunnelingInfo.pos.y = ContextMenuService.position.y;
		$scope.tunnelingInfo.text = $scope.newLink.data.text;
		SocketService.CreateElement($scope.newLink);
	};
	
	$scope.updatePage = function() {
		SocketService.UpdatePage($scope.pageSettings);
	};
	
	$scope.closeContextMenu = function() {
		ContextMenuService.forceClose = true;
	};
	ContextMenuService.openCallback = function() {
		resetLocalData();
		$scope.isOpen = true;
	};
	ContextMenuService.closeCallback = function() {
		$scope.state = 'root';
		$scope.isOpen = false;
	};
	
	ActivePageService.OnAddElement(function(element) {
		if($scope.tunnelingInfo.pos.x == element.pos.x && $scope.tunnelingInfo.pos.y == element.pos.y) {
			$scope.tunnelingInfo.isTunneling = false;
			$scope.tunnelingInfo.pos.x = -1;
			$scope.tunnelingInfo.pos.y = -1;
		}
	});
	var resetLocalData = function() {
		$scope.newLink = {
			eType: "link",
			creator: "unset",
			pos: {
				x: ContextMenuService.position.x,
				y: ContextMenuService.position.y
			},
			data: {
				text: ""
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
		};
	};
	
};
angular.module('mazenet').controller('BuildMenuController', ['$scope', 'SocketService','ActivePageService', 'ContextMenuService', 'UserService', 'CursorService', buildMenuController]);