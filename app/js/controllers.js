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

mazenetControllers.controller('MainCtrl', ['$scope', 'Page', 'SocketIo', function($scope, Page, SocketIo) {
	$scope.Page = Page;
	$scope.newPageDialog = { "visible" : "false", "x" : "0%", "y" : "0%", "pageTitle" : "", "linkText" : "", "buttonDisabled" : false, "buttonText" : "create page" };
	$scope.showPopup = function(x, y) {
		$scope.newPageDialog.x = x;
		$scope.newPageDialog.y = y;
		$scope.newPageDialog.visible = !$scope.newPageDialog.visible;
	};
	$scope.createPage = function() {
		if($scope.newPageDialog.pageTitle.length === 0 || $scope.newPageDialog.linkText.length === 0)
		{
			return;
		}
		$scope.newPageDialog.buttonText = "creating...";
		$scope.newPageDialog.buttonDisabled = true;
		SocketIo.createPage({ "name" : $scope.newPageDialog.pageTitle, "backgroundColor" : "#FFFFFF",
				"links" : [{ "x" : $scope.newPageDialog.x, "y" : $scope.newPageDialog.y, "text" : "back", "page" : Page.pageId() }] }).then(function(data) {
			var newLink = { "x" : $scope.newPageDialog.x, "y" : $scope.newPageDialog.y, "text" : $scope.newPageDialog.pageTitle, "page" : data.pageId };
			SocketIo.addLink(newLink);
			$scope.newPageDialog = { "visible" : "false", "x" : "0%", "y" : "0%", "pageTitle" : "", "linkText" : "", "buttonDisabled" : false, "buttonText" : "create page" };
			$scope.$broadcast('addLink', newLink);
		}, function(data) {
			$scope.newPageDialog = { "visible" : "false", "x" : "0%", "y" : "0%", "pageTitle" : "", "linkText" : "", "buttonDisabled" : false, "buttonText" : "create page" };
		});
	};
}]);

mazenetControllers.controller('PageCtrl', ['$scope', '$http', '$routeParams', '$interval', 'Page', 'SocketIo',
	 function($scope, $http, $routeParams, $interval, Page, SocketIo) {
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
	
	var addLinkListener = function(data) {
		if(!$scope.hasOwnProperty('links'))
			$scope.links = [];
		$scope.links.push(data);
	};
	
	$scope.$on('addLink', function(event, data) {
		addLinkListener(data);
	});
	
	SocketIo.getPage($routeParams.pageId).then(function(data) {
		Page.setPageId($routeParams.pageId);
		Page.setTitle(data.name);
		Page.setBackgroundColor(data.backgroundColor);
		$scope.name = data.name;
		$scope.links = data.links;
		$scope.cursors = data.cursors;
		$scope.liveCursors = data.liveCursors;
		frame = 0;
		SocketIo.on('userEntered', userEnteredListener);
		SocketIo.on('userExited', userExitedListener);
		SocketIo.on('otherMouseMoved', otherMouseMovedListener);
		SocketIo.on('addLink', addLinkListener);
	
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
	var tickPromise = $interval(function() { frame++; }, 1000/30);

	$scope.$on('$destroy', function handler() {
		SocketIo.removeListener('userEntered', userEnteredListener);
		SocketIo.removeListener('userExited', userExitedListener);
		SocketIo.removeListener('otherMouseMoved', otherMouseMovedListener);
		SocketIo.removeListener('addLink', addLinkListener);
		$interval.cancel(tickPromise);
	});

}]);

