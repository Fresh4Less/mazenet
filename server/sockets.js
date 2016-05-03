var CustomErrors = require('./util/custom-errors');
var socketio = require('socket.io');

var freshSocketRouter = require('fresh-socketio-router');

//sockets files generally contain two important properties:
// - router: constructor for a socket-io-router
// - middleware: a standardized constructor that produces a socketio middleware
var pagesSockets = require('./pages/sockets');
var usersSockets = require('./users/sockets');

var io;

function listen(server, options) {
	if(io) {
		console.warn('sockets already initialized');
	}

	options = options || {};

	io = socketio(server);
	var mazenetIo = io.of('/mazenet');
	var usersSocketsInstance = usersSockets('/users');
	var pagesSocketsInstance = pagesSockets('/pages');
	mazenetIo.use(usersSocketsInstance.middleware);
	mazenetIo.use(pagesSocketsInstance.middleware);

	var baseRouter = freshSocketRouter.Router();
	baseRouter.use('/users', usersSocketsInstance.router);
	baseRouter.use('/pages', pagesSocketsInstance.router);

	baseRouter.use(function(err, req, res, next) {
		if(!err.status) {
			err.status = 500;
		}
		if(err.status >= 500) {
			if(options.loggerReqName && req[options.loggerReqName]) {
				// put the error on req for the logger
				// make message and stack enumerable so they will be logged
				Object.defineProperty(err, 'message', { enumerable: true });
				Object.defineProperty(err, 'stack', { enumerable: true });
				req[options.loggerReqName].error = err;
			}
			if(!options.silent) {
				console.error(err.stack);
			}
		}
		res.status(err.status).send(err.message || 'Internal Server Error');
	});
	mazenetIo.use(freshSocketRouter(baseRouter, {
		ignoreList: usersSocketsInstance.ignoreRoutes
						.concat(pagesSocketsInstance.ignoreRoutes)
	}));
	return io;
}

module.exports = {
	listen: listen
};

