var backgroundCanvasService = function() {
	var drawSomething = function () {
		console.log("draw!")
	};
	return {
		DrawSomething: drawSomething
	};
};

angular.module('mazenet').factory('BackgroundCanvasService', [backgroundCanvasService]);