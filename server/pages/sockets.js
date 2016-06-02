var BPromise = require('bluebird');

var freshSocketRouter = require('fresh-socketio-router');

var pagesService = require('./service');
var elementsSockets = require('../elements/sockets');
var usersService = require('../users/service');
var cursorsService = require('../cursors/service');

var CustomErrors = require('../util/custom-errors');
var ValidatorErrors = require('fresh-validation').Errors;
var Validator = require('fresh-validation').Validator;

module.exports = initialze;

function initialze(route, options) {
	var elementsRoute = '/elements';

	// initialze validator
	var validator = new Validator();

	opts = Object.create(options || null);
	if(opts.pageRoomPrefix === undefined) {
		opts.pageRoomPrefix = '/pages';
	}

	var elementsSocketsInstance =  elementsSockets(elementsRoute, { pageRoomPrefix: opts.pageRoomPrefix });

	// router
	var router = freshSocketRouter.Router();

	router.get('/enter', function(req, res, next) {
		BPromise.try(function() {
			validator.is(req.body, 'body').required().object()
				.property('pId').required().objectId().back()
				.property('pos').required().object()
					.property('x').required().number().back()
					.property('y').required().number();
			validator.throwErrors();
		})
		.then(function() {
			return pagesService.getPage(req.body.pId);
		})
		.then(function(page) {
			// leave previous room
			if(req.socket.mazenet.room !== undefined) {
				req.socket.leave(req.socket.mazenet.room);
				onRoomLeft(req.socket, req.socket.mazenet.room)
					.catch(function(err) {
						//non-fatal, user doesn't need to know, but we'll print a generic error to stderr
						onCommitActiveCursorError(err);
					});
			}

			var roomName = opts.pageRoomPrefix + '/' + page._id;
			var uId = usersService.getUId(req.socket.id);
			req.socket.broadcast.to(roomName).emit(req.baseUrl + '/userEntered', { uId: uId, pos: req.body.pos });
			req.socket.join(roomName);
			req.socket.mazenet.room = roomName; // store the last room on socket for disconnect event
			var activeCursors = cursorsService.getActiveCursors(page._id);
			cursorsService.createActiveCursor(page._id, uId, req.body.pos);
			res.status(200).send({ page: page, users: activeCursors });
		})
		.catch(ValidatorErrors.ValidationError, function(err) {
			console.log(err.stack);
			err.status = 400;
			next(err);
		})
		.catch(CustomErrors.NotFoundError, function(err) {
			err.status = 404;
			next(err);
		})
		.catch(function(err) {
			next(err);
		});
	});

	router.get('/update', function(req, res, next) {
		// update the page the user is currently in
		if(req.socket.mazenet.room !== undefined) {
			pagesService.updatePage(req.socket.mazenet.room.substring((opts.pageRoomPrefix + '/').length), req.body)
				.then(function(pageChanges) {
					req.socket.broadcast.to(req.socket.mazenet.room).emit(req.baseUrl + '/updated', pageChanges);
					res.status(200).send(pageChanges);
				})
				.catch(ValidatorErrors.ValidationError, function(err) {
					err.status = 400;
					next(err);
				})
				.catch(function(err) {
					next(err);
				});
		}
		else {
			var err = new CustomErrors.UserNotOnPageError('Not on a page. Enter a page to update it.');
			err.status = 409;
			next(err);
		}
	});

	router.use(elementsRoute, elementsSocketsInstance.router);

	// middleware
	function middleware(socket, next) {
		socket.on(route + '/cursors/moved', function(frame) {
			try {
				var uId = socket.mazenet.uId;
				if(socket.mazenet.room !== undefined) {
					cursorsService.addActiveFrame(socket.mazenet.room.substring((opts.pageRoomPrefix + '/').length), uId, frame);
					socket.broadcast.to(socket.mazenet.room).emit(route + '/cursors/moved', { uId: uId, pos: frame.pos });
				}
				else {
					throw new CustomErrors.UserNotOnPageError('Not on a page. Enter a page to send cursor updates.');
				}
			}
			catch(err) {
				console.error(err.stack || (opts.pageRoomPrefix + '/cursors/moved: Failed: ' + err.message));
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
				onRoomLeft(socket, socket.mazenet.room)
					.catch(function(err) {
						onCommitActiveCursorError(err);
					});
			}
		});

		//manually call elementsSockets middleware
		elementsSocketsInstance.middleware(socket, next);
	}

	return {
		router: router,
		middleware: middleware,
		ignoreRoutes: [route + '/cursors/moved'].concat(elementsSocketsInstance.ignoreRoutes)
	};

	//helper function using closure
	function onRoomLeft(socket, room) {
		var uId = socket.mazenet.uId;
		socket.broadcast.to(room).emit(route + '/userLeft', { uId: uId });
		// save cursor to db
		return cursorsService.commitActiveCursor(room.substring((opts.pageRoomPrefix + '/').length), uId);
	}

	function onCommitActiveCursorError(err) {
		console.error(err.stack || (opts.pageRoomPrefix + ': Failed to commit active cursor: ' + err.message));
	}
}


