var CustomErrors = require('./util/custom-errors');
var socketio = require('socket.io');

var pagesSockets = require('./pages/sockets');
var usersSockets = require('./users/sockets');

var io;

function listen(server) {
	if(io) {
		console.warn('sockets already initialized');
	}

	io = socketio(server);
	var mazenetIo = io.of('/mazenet');
	pagesSockets.registerHandlers('pages', mazenetIo);
	usersSockets.registerHandlers('users', mazenetIo);
	return io;
}

module.exports = {
	listen: listen
};

