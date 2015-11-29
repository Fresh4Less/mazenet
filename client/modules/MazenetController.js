function mazenetController($scope, $window, SocketService, ActivePageService, UserService) {
	var cursorTimeout = true;
	var networkTiming = 30;
	//Scope Variables
	$scope.page = ActivePageService.PageData;
	
	$scope.CursorMove = function($event) {
		if(ActivePageService.PageData) {
			if(cursorTimeout) {
				cursorTimeout = false;
				
				var cursorMove = {
					pos: {
						x: $event.clientX / $window.innerWidth,
						y: $event.clientY / $window.innerHeight
					},
					t: frameDifference(ActivePageService.PageData.enterTime, new Date().getTime())
				};			
				
				SocketService.CursorMove(cursorMove);
				
				window.setTimeout(function() {
					cursorTimeout = true;
				}, (1000/networkTiming));	
			}	
		}
	};
	UserService.RedrawCallback = function() {
		$scope.$apply();
	};
	$scope.OtherUsers = UserService.OtherUsers;
	//End Scope
	
	function frameDifference(oldTime, newTime) {
		var difference = newTime - oldTime;
		return Math.ceil((difference / 1000) * networkTiming);
		
	}
}

angular.module('mazenet').controller('MazenetController', ['$scope', '$window', 'SocketService','ActivePageService','UserService', mazenetController]);