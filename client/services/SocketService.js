angular.module('mazenet').factory ('SocketService', function ($q, $http) {
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
		LoadPage : loadPage,
		CreateLink : createLink
	}
});