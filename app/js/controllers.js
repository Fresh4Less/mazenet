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
	SocketIo.on('userEntered', function(data) {
		$scope.liveCursors[data.id] = { "x" : "0%", "y" : "0%"};
		console.log("user entered: " + data.id);
	});
	SocketIo.on('userExited', function(data) {
		console.log("user exited: " + data.id);
		delete $scope.liveCursors[data.id];
	});
	SocketIo.on('otherMouseMoved', function(data) {
		console.log('moved by ' + data.id);
		console.log($scope.liveCursors);
		console.log($scope.name);
		var liveCursor = $scope.liveCursors[data.id];
		liveCursor.x = data.x + "%";
		liveCursor.y = data.y + "%";
	});
	
	SocketIo.getPage($routeParams.pageId).then(function(data) {
		Page.setTitle(data.name);
		Page.setBackgroundColor(data.backgroundColor);
		$scope.name = data.name;
		$scope.links = data.links;
		//test code
		var cursors = [];
		for(var j = 10; j<90; j++)
		{
		var cursorFrames = [];
		for(var i = 10; i<90; i++)
		{
			cursorFrames.push({"x":i+"%", "y":j+"%"});
		}
		cursors.push({"frames" : cursorFrames});
		}
		//end test code
		$scope.cursors = cursors;
		console.log("connected to page");
		console.log($scope.liveCursors);
		$scope.liveCursors = data.liveCursors;
		console.log($scope.liveCursors);
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
	(function tick() {
		frame++;
		$timeout(tick, 1000/30);
	})();
}]);

