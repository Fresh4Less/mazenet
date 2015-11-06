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
	
	function createPage(page) {
		var promise = $q.defer();
		$http.post('/pages', {
			"creator": "101010101010101010101010",
    		"permissions": "all",
    		"title": page.title,
    		"background": {
        	"type": "color",
       		"data": {
           		"color": page.color
        	}
   		 }
		}).then(function(page) {
			promise.resolve(page);
		}, function (error){
			promise.reject(error);
		});
		
		return promise.promise;
	}
	
	return {
		LoadPage : loadPage,
		CreatePage : createPage
	}
})