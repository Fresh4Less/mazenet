/*MAZENET - Fresh4Less [ Elliot Hatch, Samuel Davidson ]*/

var app = angular.module('mazenet', []);
app.controller('RootController', function($scope, PageService) {
	updateBG()
	PageService.UpdateColorCallback  = updateBG;
	function updateBG() {
		$scope.background = PageService.GetColor();
	}
});;
;
angular.module('mazenet').controller('MazenetController', ['$scope', 'SocketService','PageService', MazenetController]);

function MazenetController($scope, SocketService, PageService) {
	$scope.testVar = "MazenetController loaded!";
	$scope.pageId = '56292c14f0565a484354cf8e';
	$scope.page = undefined;
	$scope.loadPage = function() {
		SocketService.LoadPage($scope.pageId).then(function(data) {
			console.log(data);
			$scope.page = data;
			PageService.SetColor(data.background.data.color);
		}, function(error) {
			console.error(error);
		});
	}
};;
angular.module('mazenet').directive('mzMazenet', function() {
	return {
		restrict: 'E',
		templateUrl: '/modules/MazenetTemplate.html',
		controller: 'MazenetController'
	}
});;
angular.module('mazenet').factory('PageService', function($q) {
	var ret = {
		GetColor : getColor,
		UpdateColorCallback : null,
		SetColor : setColor
	}; 
	var color = '#af2266';
	function setColor(newColor) {
		color = newColor;
		if(ret.UpdateColorCallback){
			ret.UpdateColorCallback();
		}
	}
	function getColor() {
		return color;
	}
	return ret;
});;
angular.module('mazenet').factory ('SocketService', function ($q) {
	function loadPage(pageId) {
		var promise = $q.defer();
		var startPage = pageId;
  		var socket = io('http://localhost:8090/mazenet');
  		socket.on('pages/enter:success', function(page) {
			promise.resolve(page);
		});
  		socket.on('pages/enter:failure', function(error) {
			promise.reject(error);
		});
  		socket.emit('pages/enter', startPage);
		return promise.promise;	
	}
	
	return {
		LoadPage : loadPage
	}
})