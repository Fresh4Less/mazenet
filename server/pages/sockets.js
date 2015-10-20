var pagesService = require('./service');
var elementsSockets = require('../elements/sockets');

var CustomErrors = require('../util/custom-errors');
var ValidatorErrors = require('fresh-validation').Errors;

function registerHandlers(route, io) {
	io.on('connection', function(socket) {
		socket.on(route + '/enter', function(pageId) {
			pagesService.getPage(pageId)
				.then(function(page) {
					// leave all related rooms
					socket.rooms.forEach(function(r) {
						if(r.indexOf(route) === 0) {
							socket.leave(r);
						}
					});
					socket.join(route + '/' + page._id);
					socket.emit(route + '/enter:success', page);
				})
				.catch(ValidatorErrors.ValidationError, function(err) {
					err.status = 400;
					socket.emit(route + '/enter:failure', err);
				})
				.catch(CustomErrors.NotFoundError, function(err) {
					err.status = 404;
					socket.emit(route + '/enter:failure', err);
				});
		});
	});
	elementsSockets.registerHandlers(route + '/elements', io);
}

module.exports = {
	registerHandlers: registerHandlers
};

