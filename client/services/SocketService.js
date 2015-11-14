/* global io */
var socketService = function ($q, $http, UserService, ActivePageService) {
	var socket = null;
	/* Event Handlers */
	var connected = function(userId) {
		console.log("Connected. Id:", userId);
		UserService.UserData.id = userId;
	}
	
	/* External Functions */
	function init() {
		if(!socket || !socket.connected) {
			console.log("Socket initialized");
			socket = io('http://localhost:8090/mazenet');
			socket.on('users/connected', connected);
		}
	}
	
	function enterPage(pageId) {
		var promise = $q.defer();
		var startPage = pageId;
  		socket.on('pages/enter:success', function(page) {
			ActivePageService.UpdatePage(page);
			promise.resolve(page);
		});
  		socket.on('pages/enter:failure', function(error) {
			promise.reject(error);
		});
		socket.emit('pages/enter', startPage);
		return promise.promise;	
	}
	
	function createLink(pageId, link) {
		var promise = $q.defer();
		$http.post('/pages/'+ pageId +'/elements', link)
		.then(function(page) {
			promise.resolve(page);
		}, function (error){
			promise.reject(error);
		});
		
		return promise.promise;
	}
	
	return {
		Init : init,
		EnterPage : enterPage,
		CreateLink : createLink
	}
};

angular.module('mazenet').factory ('SocketService', ['$q', '$http', 'UserService', 'ActivePageService', socketService]);
