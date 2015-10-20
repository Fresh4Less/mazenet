var sockets = require('../sockets');
var elementsService = require('./service');

var CustomErrors = require('../util/custom-errors');
var ValidatorErrors = require('fresh-validation').Errors;

function registerHandlers(route, io) {
	io.on('connection', function(socket) {
		socket.on(route + '/create', function(params) {
			// find the room the user is currently in and create the element there
			socket.rooms.forEach(function(r) {
				if(r.indexOf('pages') === 0) {
					elementsService.createElement(r.substring('pages/'.length), params)
					.then(function(element) {
						socket.emit(route + '/created', element);
					})
					.catch(ValidatorErrors.ValidationError, function(err) {
						err.status = 400;
						socket.emit(route + '/create:failure', err);
					})
					.catch(CustomErrors.NotFoundError, function(err) {
						err.status = 404;
						socket.emit(route  + '/create:failure', err);
					});
				}
			});
		});
	});
}

module.exports = {
	registerHandlers: registerHandlers
};

