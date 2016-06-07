var freshSocketRouter = require('fresh-socketio-router');

var sockets = require('../sockets');
var elementsService = require('./service');

var CustomErrors = require('../util/custom-errors');
var ValidatorErrors = require('fresh-validation').Errors;

module.exports = initialze;

function initialze(route, options) {
	opts = Object.create(options || null);
	if(opts.pageRoomPrefix === undefined) {
		opts.pageRoomPrefix = '/pages';
	}

	var router = freshSocketRouter.Router();

	router.get('/create', function(req, res, next) {
		// find the room the user is currently in and create the element there
		if(req.socket.mazenet.room === undefined) {
			var err = new CustomErrors.UserNotOnPageError('Not on a page. Enter a page to create an element on it.');
			err.status = 409;
			return next(err);
		}

		if(req.body !== undefined) {
			req.body.creator = req.socket.mazenet.uId;
		}

		elementsService.createElement(req.socket.mazenet.room.substring((opts.pageRoomPrefix + '/').length), req.body)
		.then(function(element) {
			req.socket.broadcast.to(req.socket.mazenet.room).emit(req.baseUrl + '/created', element);
			res.status(201).send(element);
		})
		.catch(ValidatorErrors.ValidationError, function(err) {
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

	function middleware(socket, next) {
		next();
	}

	return {
		router: router,
		middleware: middleware,
		ignoreRoutes: []
	};
}
