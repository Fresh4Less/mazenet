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

mazenetControllers.controller('MainCtrl', ['$scope', 'Page', 'SocketIo', 'ContextMenuService', function($scope, Page, SocketIo, ContextMenuService) {
	$scope.Page = Page;
	$scope.newPageDialog = { "visible" : "false", "x" : 0, "y" : 0, "pageTitle" : "", "linkText" : "", "buttonDisabled" : false, "buttonText" : "create page" };
	$scope.showNewPageDialog = function() {
		var leftStr = ContextMenuService.menuElement.css('left');
		var topStr = ContextMenuService.menuElement.css('top');
		$scope.newPageDialog.x = parseFloat(leftStr.substr(0, leftStr.length-2))/$(window).width()*100;
		$scope.newPageDialog.y = parseFloat(topStr.substr(0, topStr.length-2))/$(window).height()*100;
		$scope.newPageDialog.visible = 'switching';
		var watch = $scope.$watch('$scope.newPageDialog.visible', function() {
			$scope.newPageDialog.visible = 'true';
			watch();
		});
	};
	
	$scope.hideNewPageDialog = function() {
		$scope.newPageDialog = { "visible" : "false", "x" : 0, "y" : 0, "pageTitle" : "", "linkText" : "", "buttonDisabled" : false, "buttonText" : "create page" };
	};
	
	$scope.createPage = function() {
		if($scope.newPageDialog.pageTitle.length === 0 || $scope.newPageDialog.linkText.length === 0)
		{
			return;
		}
		$scope.newPageDialog.buttonText = "creating...";
		$scope.newPageDialog.buttonDisabled = true;
		var backgroundColor = RGBtoHex(HSVtoRGB(Math.floor(Math.random() * 12) / 12, 0.5, 1.0));
		SocketIo.createPage({ "name" : $scope.newPageDialog.pageTitle, "backgroundColor" : backgroundColor, "depth" : Page.depth() + 1,
				"links" : [{ "x" : $scope.newPageDialog.x, "y" : $scope.newPageDialog.y, "text" : Page.title(), "page" : Page.pageId(), "classes" : "backLink" }] }).then(function(data) {
			var newLink = { "x" : $scope.newPageDialog.x, "y" : $scope.newPageDialog.y, "text" : $scope.newPageDialog.linkText, "page" : data.pageId };
			SocketIo.addLink(newLink);
			$scope.newPageDialog = { "visible" : "false", "x" : 0, "y" : 0, "pageTitle" : "", "linkText" : "", "buttonDisabled" : false, "buttonText" : "create page" };
			$scope.$broadcast('addLink', newLink);
		}, function(data) {
			$scope.newPageDialog = { "visible" : "false", "x" : 0, "y" : 0, "pageTitle" : "", "linkText" : "", "buttonDisabled" : false, "buttonText" : "create page" };
		});
	};
}]);

mazenetControllers.controller('PageCtrl', ['$scope', '$http', '$routeParams', '$interval', 'Page', 'SocketIo',
	 function($scope, $http, $routeParams, $interval, Page, SocketIo) {
	var frame = 0;
	$scope.liveCursors = {};
	$scope.getCursorX = function(cursor) {
		return cursor.frames[Math.min(frame, cursor.frames.length-1)].x + "%";
	};
	$scope.getCursorY = function(cursor) {
		return cursor.frames[Math.min(frame, cursor.frames.length-1)].y + "%";
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
		liveCursor.x = data.x + "%";
		liveCursor.y = data.y + "%";
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
		//convert positions to percentages
		for(var i in data.links)
		{
			data.links[i].x += "%";
			data.links[i].y += "%";
		}
		for(var j in data.cursors)
		{
			var cursor = data.cursors[j];
			for(var k in cursor.frames)
			{
				cursor.frames[k].x += "%";
				cursor.frames[k].y += "%";
			}
		}
		Page.setPageId($routeParams.pageId);
		Page.setTitle(data.name);
		Page.setBackgroundColor(data.backgroundColor);
		Page.setDepth(data.depth);
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
		$scope.links = null; $scope.cursors = null;
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

/* accepts parameters
 * h  Object = {h:x, s:y, v:z}
 * OR 
 * h, s, v
*/
function HSVtoRGB(h, s, v) 
{
	var r, g, b, i, f, p, q, t;
	if (h && s === undefined && v === undefined) {
		s = h.s; v = h.v; h = h.h;
	}
	i = Math.floor(h * 6);
	f = h * 6 - i;
	p = v * (1 - s);
	q = v * (1 - f * s);
	t = v * (1 - (1 - f) * s);
	switch (i % 6) {
		case 0: r = v; g = t; b = p; break;
		case 1: r = q; g = v; b = p; break;
		case 2: r = p; g = v; b = t; break;
		case 3: r = p; g = q; b = v; break;
		case 4: r = t; g = p; b = v; break;
		case 5: r = v; g = p; b = q; break;
	}
	return {
		r: Math.floor(r * 255),
		g: Math.floor(g * 255),
		b: Math.floor(b * 255)
	};
}

//0-255
function RGBtoHex(r, g, b)
{
	if(r && g === undefined && b === undefined) {
	g = r.g; b = r.b; r = r.r;
}
	var decColor = (r << 16) + (g << 8) + b;
	return "#" + decColor.toString(16);
}
