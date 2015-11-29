function linkElementController($scope, ActivePageService, SocketService) {
	$scope.EnterPage = function($event, pId) { 
		var id = pId;
		if(!pId) {
			id = ActivePageService.RootPages.root;
		}
		var pos = {
			x: $event.clientX,
			y: $event.clientY
		};
		
		SocketService.EnterPage(id, pos).then(function(data) {
			//Success :)
		}, function(error) {
			console.error('Error entering page:', id, error);
			alert("Unable To Enter Page.\n" + error.message);
		});
	};
	
}
angular.module('mazenet').controller('LinkElementController',['$scope', 'ActivePageService', 'SocketService', linkElementController]);