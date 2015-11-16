var usersService = require('./service');
var pagesService = require('../pages/service');
var CustomErrors = require('../util/custom-errors');

function registerHandlers(route, io) {
	io.on('connection', function(socket) {
		var uId = usersService.userConnected(socket.id);
		socket.mazenet = { uId: uId };
		pagesService.getRootPageId()
			.then(function(pageId) {
				socket.emit(route + '/connected', { uId: uId, rootPageId: pageId });
			})
			.catch(CustomErrors.NotFoundError, function(err) {
				err.status = 404;
				socket.emit(route + '/connected:failure', err);
			})
			.catch(function(err) {
				console.log(err.stack);
				err.status = 500;
				socket.emit(route + '/connected:failure', err);
			});
		socket.on('disconnect', function() {
			usersService.userDisconnected(socket.id);
		});
	});
}


module.exports = {
	registerHandlers: registerHandlers
};

