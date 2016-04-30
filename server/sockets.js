var CustomErrors = require('./util/custom-errors');
var socketio = require('socket.io');

var freshSocketRouter = require('fresh-socketio-router');

var pagesSockets = require('./pages/sockets');
var usersSockets = require('./users/sockets');

var io;

function listen(server) {
	if(io) {
		console.warn('sockets already initialized');
	}

	io = socketio(server);
	var mazenetIo = io.of('/mazenet');
	//pagesSockets.registerHandlers('pages', mazenetIo);
	//usersSockets.registerHandlers('users', mazenetIo);
	mazenetIo.use(usersSockets.middleware); //initializes socket.mazenet

	var baseRouter = freshSocketRouter.Router();
	baseRouter.use('/users', usersSockets.router);

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
	mazenetIo.use(freshSocketRouter(baseRouter));
	return io;
}

module.exports = {
	listen: listen
};

