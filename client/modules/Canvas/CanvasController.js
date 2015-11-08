var canvasController = function ($scope, $timeout, BackgroundCanvasService, ActivePageService) {
	var canvas = null;
	var cContext = null;
	
	$scope.id = 0;
	$scope.target = null;
	$scope.globalPageStyles = ActivePageService.styles;
	
	$scope.$watch('target', function(newValue, oldValue) {
		//Do something with id and target
		$timeout(function() {
			canvas = document.getElementById('canvas-'+$scope.id);
			if(canvas) {
				cContext = canvas.getContext("2d");
				cContext.font = "30px Arial";
				cContext.fillText("Hello World",10,50);
			} else {
				console.error("Error loading canvas.", newValue);	
			}
		})
	});

}
angular.module('mazenet').controller('CanvasController', ['$scope', '$timeout', 'BackgroundCanvasService', 'ActivePageService', canvasController]);