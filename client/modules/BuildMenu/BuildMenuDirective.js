angular.module('mazenet').directive('mzBuildMenu', function() {
	return {
		restrict: 'E',
		templateUrl: '/modules/BuildMenu/BuildMenuTemplate.html',
		controller: 'BuildMenuController'
	}
});