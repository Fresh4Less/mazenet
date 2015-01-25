//directives.js

var mazenetDirectives = angular.module('mazenetDirectives', []);

mazenetDirectives.directive('popupMenu', ['$document', '$parse', '$compile', function($document, $parse, $compile) {
	
	return {
		restrict: 'E',
		transclude: true,
		template: '<div ng-hide="true" ng-transclude></div>',
		link: function(scope, element, attrs) {
			attrs.$observe('visible', function(value) {
				if(value === "true")
				{
					element.parent().popover('show');
				}
				else
				{
					element.parent().popover('hide');
				}
			});
			element.parent().popover({ 'content' : function() { return $compile(element.children().first().html())(scope); },
									'html' : true, 'trigger' : 'manual', 'placement' : 'top'}).data('bs.popover').tip().addClass('popupMenu');
		}
	};
}]);


