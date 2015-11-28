angular.module('mazenet').directive('mzElement', function() {
	return {
		restrict: 'E',
		scope: {
			element: '='
		},
		templateUrl: '/modules/Elements/ElementTemplate.html',
	}
});