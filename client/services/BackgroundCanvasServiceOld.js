var backgroundCanvasService = function() {
	var drawSomething = function () {
	};
	return {
		DrawSomething: drawSomething
	};
};

angular.module('mazenet').factory('BackgroundCanvasService', [backgroundCanvasService]);