//services

var mazenetServices = angular.module('mazenetServices', []);

mazenetServices.factory('Page', function() {
	var title = '';
	var backgroundColor = '#ffffff';
	var pageId = '';
	return {
		title: function() {return title; },
		setTitle: function(newTitle) { title = newTitle; },
		backgroundColor: function() { return backgroundColor; },
		setBackgroundColor: function(newBackgroundColor) { backgroundColor = newBackgroundColor; },
		pageId: function() { return pageId; },
		setPageId: function(newPageId) { pageId = newPageId; }
	};
});

mazenetServices.factory('SocketIo', ['$q', '$interval', function($q, $interval) {
	var socket = io();
	var sendMovement = true;
	$(document).mousemove(function(event) {
		if(sendMovement)
			socket.emit('mouseMoved', { "x" : event.pageX/$(window).width()*100+"%", "y" : event.pageY/$(window).height()*100+"%" });
		sendMovement = false;
	});
	
	var tickPromise = $interval(function() { sendMovement = true; }, 1000/30);
	return {
		on : function(eventName, callback) {
				socket.on(eventName, callback);
		},
		removeListener : function(eventName, listener) {
				socket.removeListener(eventName, listener);
		},
		getPage : function(pageId) {
			var deferred = $q.defer();
				socket.emit('getPage', pageId, function(data) {
					if(data.status == 'success')
						deferred.resolve(data);
					else
						deferred.reject(data);
			});
			return deferred.promise;
		},
		createPage : function(pageParams) {
			var deferred = $q.defer();
				socket.emit('createPage', pageParams, function(data) {
					if(data.status == 'success')
						deferred.resolve(data);
					else
						deferred.reject(data);
			});
			return deferred.promise;
		},
		addLink : function(linkParams) {
			var deferred = $q.defer();
				socket.emit('addLink', linkParams, function(data) {
					if(data.status == 'success')
						deferred.resolve(data);
					else
						deferred.reject(data);
			});
			return deferred.promise;
		}
	};
}]);

