angular.module('mazenet').directive('mzLinkElement', function() {
	return {
		restrict: 'E',
		scope: {
			element: '='
		},
		templateUrl: '/modules/Elements/Link/LinkElementTemplate.html',
		controller: 'LinkElementController'
	};
});