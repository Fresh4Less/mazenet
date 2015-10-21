/*MAZENET - Fresh4Less [ Elliot Hatch, Samuel Davidson ]*/

var app = angular.module('mazenet', []);
app.controller('RootController', function($scope) {
	$scope.test = "Controller Loaded!";
});;
function MazenetController($scope) {
	
}

angular.module('mazenet').controller('MazenetController', ['$scope', MazenetController]);;
