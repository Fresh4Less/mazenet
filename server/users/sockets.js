var usersService = require('./service');

function registerHandlers(route, io) {
	io.on('connection', function(socket) {
		var uId = usersService.userConnected(socket.id);
		socket.mazenet = { uId: uId };
		socket.emit(route + '/connected', { uId: uId });
		socket.on('disconnect', function() {
			usersService.userDisconnected(socket.id);
		});
	});
}


module.exports = {
	registerHandlers: registerHandlers
};

