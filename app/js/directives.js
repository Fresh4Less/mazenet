//directives.js

var mazenetDirectives = angular.module('mazenetDirectives', []);

mazenetDirectives.directive('popupMenu', ['$document', '$parse', '$compile', function($document, $parse, $compile) {
	
	return {
		restrict: 'E',
		transclude: true,
		template: '<div ng-hide="true" ng-transclude></div>',
		link: function(scope, element, attrs) {
			attrs.$observe('visible', function(value) {
				if(value === 'true')
				{
					element.parent().popover('show');
				}
				else if(value === 'false')
				{
					element.parent().popover('hide');
				}
			});
			var content = $compile(element.children().first().html())(scope);
			element.parent().popover({ 'content' : content,
									'html' : true, 'trigger' : 'manual', 'placement' : 'top'}).data('bs.popover').tip().addClass('popupMenu');
		}
	};
}]);


