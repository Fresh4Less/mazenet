angular.module('mazenet').directive('mzMazenet', function() {
	return {
		restrict: 'E',
		templateUrl: '/modules/MazenetTemplate.html',
		controller: 'MazenetController'
	}
});