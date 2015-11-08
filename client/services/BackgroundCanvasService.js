angular.module('mazenet').factory('BackgroundCanvasService', function() {
	var drawSomething = function () {
		console.log("draw!")
	};
	return {
		DrawSomething: drawSomething
	};
});