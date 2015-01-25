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

mazenetServices.factory('SocketIo', ['$q', function($q) {
	var socket = io();
	$(document).mousemove(function(event) {
		socket.emit('mouseMoved', { "x" : event.pageX/$(window).width()*100, "y" : event.pageY/$(window).height()*100 });
	});
	return {
		on : function(eventName, callback) {
				socket.on(eventName, callback);
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
		}
		
	};
}]);

mazenetServices.factory('ContextMenuService', function() {
	return {
		TestF : function() {
			// Call the method in the controllers. I think. Not sure how to do that.
		}
	};
});
