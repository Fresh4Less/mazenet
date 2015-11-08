angular.module('mazenet').directive('mzCanvas', function() {
	return {
		restrict: 'E',
		templateUrl: '/modules/Canvas/CanvasTemplate.html',
		scope : {
			target: '@',
		},
		controller: 'CanvasController',
		replace: true
	}
});