//controllers

var mazenetControllers = angular.module('mazenetControllers', []);

mazenetControllers.controller('ItemListCtrl', ['$scope', '$http', function($scope, $http) {
	$http.get('data/items.json').success(function(data) {
		$scope.items = data;
	});
	
	$scope.orderProp = 'title';
}]);

mazenetControllers.controller('ItemDetailCtrl', ['$scope', '$routeParams', function($scope, $routeParams) {
	$scope.itemId = $routeParams.itemId;
}]);

mazenetControllers.controller('MainCtrl', ['$scope', 'Page', function($scope, Page) {
	$scope.Page = Page;
}]);

mazenetControllers.controller('PageCtrl', ['$scope', '$http', '$routeParams', '$timeout', 'Page', 'SocketIo',
	 function($scope, $http, $routeParams, $timeout, Page, SocketIo) {
	var frame = 0;
	$scope.liveCursors = {};
	$scope.getCursorX = function(cursor) {
		return cursor.frames[Math.min(frame, cursor.frames.length-1)].x;
	};
	$scope.getCursorY = function(cursor) {
		return cursor.frames[Math.min(frame, cursor.frames.length-1)].y;
	};
	$scope.getCursorOpacity = function() {
		return (0.8-0.4)*Math.pow($scope.cursors.length, -1.1) + 0.4;
	};
	var userEnteredListener = function(data) {
		$scope.liveCursors[data.id] = { "x" : "0%", "y" : "0%"};
	};

	var userExitedListener = function(data) {
		delete $scope.liveCursors[data.id];
	};
	
	var otherMouseMovedListener = function(data) {
		var liveCursor = $scope.liveCursors[data.id];
		liveCursor.x = data.x;
		liveCursor.y = data.y;
	};
	
	SocketIo.on('userEntered', userEnteredListener);
	SocketIo.on('userExited', userExitedListener);
	SocketIo.on('otherMouseMoved', otherMouseMovedListener);
	
	SocketIo.getPage($routeParams.pageId).then(function(data) {
		Page.setTitle(data.name);
		Page.setBackgroundColor(data.backgroundColor);
		$scope.name = data.name;
		$scope.links = data.links;
		$scope.cursors = data.cursors;
		console.log(data);
		$scope.liveCursors = data.liveCursors;
		frame = 0;
	}, function(data, status) {
		var name = 'Error: ' + status;
		Page.setTitle(name);
		Page.setBackgroundColor('#ffffff');
		$scope.name = name;
		$scope.links = null;
		$scope.cursors = null;
		$scope.liveCursors = null;
		frame = 0;
	});
	var tickPromise = null;
	(function tick() {
		frame++;
		tickPromise = $timeout(tick, 1000/30);
	})();

	$scope.$on('$destroy', function handler() {
		SocketIo.removeListener('userEntered', userEnteredListener);
		SocketIo.removeListener('userExited', userExitedListener);
		SocketIo.removeListener('otherMouseMoved', otherMouseMovedListener);
		$timeout.cancel(tickPromise);
	});

}]);

