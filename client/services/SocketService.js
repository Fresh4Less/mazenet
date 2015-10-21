angular.module('mazenet').factory ('SocketService', function ($q) {
	function setup() {
		var promise = $q.defer();
		var startPage = '56272e37cb88f4dc71a293a5';
  		var socket = io('http://localhost:8090/mazenet');
  		socket.on('pages/enter:success', function(page) {
			promise.resolve(page);
		});
  		socket.on('pages/enter:failure', function(error) {
			promise.reject(error);
		});
  		socket.on('pages/elements/created', function(element) {
			console.log('element created');
			console.log(element);
		});
  		socket.on('pages/elements/create:failure', function(error) {
			console.log(error);
		});
  		socket.emit('pages/enter', startPage);
  		socket.emit('pages/elements/create', {
            "type": "link",
            "creator": "101010101010101010101012",
            "pos": {
                "x": 40,
                "y": 40
            },
            "data": {
                "text": "my link22!"
            }
		});
		return promise.promise;	
	}
	
	return {
		Setup : setup
	}
})