function mazenetController($scope, SocketService, ActivePageService, UserService) {
	var cursorTimeout = true;
	var networkTiming = 30;
	//Scope Variables
	$scope.pageId = '563ff6d5ed248da731bcfae6';
	$scope.page = ActivePageService.pageData;
	
	//Scope Functions
	$scope.EnterPage = function($event, pId) { 
		var id = pId;
		if(!pId) {
			id = $scope.pageId
		}
		var pos = {
			x: $event.clientX,
			y: $event.clientY
		};
		
		SocketService.EnterPage(id, pos).then(function(data) {
			//Page entered
		}, function(error) {
			console.error('Error entering page:', id, error);
			alert("Unable To Enter Page.\n" + error);
		});
	}
	
	$scope.CursorMove = function($event) {
		if(cursorTimeout) {
			cursorTimeout = false;
			
			var cursorMove = {
				pos: {
					x: $event.clientX / $event.target.clientWidth,
					y: $event.clientY / $event.target.clientHeight
				},
				t: frameDifference(ActivePageService.pageData.enterTime, new Date().getTime())
			}			
			
			SocketService.CursorMove(cursorMove);
			
			window.setTimeout(function() {
				cursorTimeout = true;
			}, (1000/networkTiming));	
		}
	}
	UserService.RedrawCallback = function() {
		$scope.$apply();
	}
	$scope.OtherUsers = UserService.OtherUsers;
	//End Scope
	
	function frameDifference(oldTime, newTime) {
		var difference = newTime - oldTime;
		return Math.ceil((difference / 1000) * networkTiming);
		
	}
};

angular.module('mazenet').controller('MazenetController', ['$scope', 'SocketService','ActivePageService','UserService', mazenetController]);