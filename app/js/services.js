//services

var mazenetServices = angular.module('mazenetServices', []);

mazenetServices.factory('Page', function() {
	var title = '';
	var backgroundColor = '#ffffff';
	return {
		title: function() {return title; },
		setTitle: function(newTitle) { title = newTitle; },
		backgroundColor: function() { return backgroundColor; },
		setBackgroundColor: function(newBackgroundColor) { backgroundColor = newBackgroundColor; }
	};
});

mazenetServices.factory('SocketIo', ['$q', '$timeout', function($q, $timeout) {
	var socket = io();
	var sendMovement = true;
	$(document).mousemove(function(event) {
		if(sendMovement)
			socket.emit('mouseMoved', { "x" : event.pageX/$(window).width()*100+"%", "y" : event.pageY/$(window).height()*100+"%" });
		sendMovement = false;
	});
	
	(function tick() {
		sendMovement = true;
		tickPromise = $timeout(tick, 1000/30);
	})();
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
		}
		
	};
}]);

