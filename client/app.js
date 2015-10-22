var app = angular.module('mazenet', []);
app.controller('RootController', function($scope, PageService) {
	updateBG()
	PageService.UpdateColorCallback  = updateBG;
	function updateBG() {
		$scope.background = PageService.GetColor();
	}
});