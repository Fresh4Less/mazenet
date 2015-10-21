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
					var roomName = route + '/' + page._id;
					io.sockets.to(roomName).emit(route + '/userEntered', socket.id);
					socket.join(roomName);
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
		socket.on(route + '/cursors/create', function(params) {
			socket.rooms.forEach(function(r) {
				if(r.indexOf('pages') === 0) {
					pagesService.createCursor(r.substring('pages/'.length), params)
					.then(function(cursor) {
						socket.emit(route + '/cursors/created', cursor);
					})
					.catch(ValidatorErrors.ValidationError, function(err) {
						err.status = 400;
						socket.emit(route + '/cursors/create:failure', err);
					})
					.catch(CustomErrors.NotFoundError, function(err) {
						err.status = 404;
						socket.emit(route  + '/cursors/create:failure', err);
					});
				}
			});
		});
		function leaveRoom(room) {
			socket.leave(room);
			io.sockets.to(room).emit(route + '/userLeft'
		}
	});
	elementsSockets.registerHandlers(route + '/elements', io);
}


module.exports = {
	registerHandlers: registerHandlers
};

