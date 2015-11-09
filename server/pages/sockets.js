var BPromise = require('bluebird');
var pagesService = require('./service');
var elementsSockets = require('../elements/sockets');
var usersService = require('../users/service');
var cursorsService = require('../cursors/service');

var CustomErrors = require('../util/custom-errors');
var ValidatorErrors = require('fresh-validation').Errors;
var Validator = require('fresh-validation').Validator;

// initialze validator
var validator = new Validator();

function registerHandlers(route, io) {
	io.on('connection', function(socket) {
		socket.on(route + '/enter', function(params) {
			BPromise.try(function() {
				validator.is(params, 'enterParams').required().object()
					.property('pId').required().objectId().back()
					.property('pos').required().object()
						.property('x').required().number().back()
						.property('y').required().number();
				validator.throwErrors();
			})
			.then(function() {
				return pagesService.getPage(params.pId);
			})
			.then(function(page) {
				// leave all related rooms
				socket.rooms.forEach(function(r) {
					if(r.indexOf(route) === 0) {
						socket.leave(r);
						onRoomLeft(r);
					}
				});
				var roomName = route + '/' + page._id;
				var uId = usersService.getUId(socket.id);
				io.to(roomName).emit(route + '/userEntered', { uId: uId, pos: params.pos });
				socket.join(roomName);
				socket.mazenet.room = roomName; // workaround to store the last room on socket for disconnect event
				var activeCursors = cursorsService.getActiveCursors(page._id);
				cursorsService.createActiveCursor(page._id, uId, params.pos);
				socket.emit(route + '/enter:success', { page: page, users: activeCursors });
			})
			.catch(ValidatorErrors.ValidationError, function(err) {
				err.status = 400;
				socket.emit(route + '/enter:failure', err);
			})
			.catch(CustomErrors.NotFoundError, function(err) {
				err.status = 404;
				socket.emit(route + '/enter:failure', err);
			})
			.catch(function(err) {
				console.log(err.stack);
				err.status = 500;
				socket.emit(route + '/enter:failure', err);
			});
		});
		socket.on(route + '/cursors/moved', function(frame) {
			try {
				var uId = usersService.getUId(socket.id);
				socket.rooms.forEach(function(r) {
					if(r.indexOf(route) === 0) {
						cursorsService.addActiveFrame(r.substring('pages/'.length), uId, frame);
						socket.broadcast.to(r).emit(route + '/cursors/moved', { uId: uId, pos: frame.pos });
					}
				});
			}
			catch(err) {
				console.error('pages/sockets: ' + route + '/cursors/moved: Failed: ' + err);
			}
		});
		socket.on('disconnect', function() {
			// doesn't work because socket.io leaves the rooms before disconnect event
			//socket.rooms.forEach(function(r) {
				//if(r.indexOf(route) === 0) {
					//onRoomLeft(r);
				//}
			//});
			// so we have to use this workaround property we set earlier
			if(socket.mazenet.room !== undefined) {
				onRoomLeft(socket.mazenet.room);
			}
		});
		function onRoomLeft(room) {
			var uId = usersService.getUId(socket.id);
			io.to(room).emit(route + '/userLeft', { uId: uId });
			// save cursor to db
			cursorsService.commitActiveCursor(room.substring('pages/'.length), uId)
				.then(function(cursor) {
				})
				.catch(function(err) {
					console.error('Failed to create cursor: ' + err);
				});
		}
	});
	elementsSockets.registerHandlers(route + '/elements', io);
}

module.exports = {
	registerHandlers: registerHandlers
};

