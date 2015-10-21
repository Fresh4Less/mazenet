var usersService = require('./service');

function registerHandlers(route, io) {
	io.on('connection', function(socket) {
		usersService.userConnected(socket.id);
		socket.on('disconnect', function() {
			usersService.userDisconnected(socket.id);
		});
	});
}


module.exports = {
	registerHandlers: registerHandlers
};

