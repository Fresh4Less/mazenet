var freshSocketRouter = require('fresh-socketio-router');

var usersService = require('./service');
var pagesService = require('../pages/service');
var CustomErrors = require('../util/custom-errors');

var router = freshSocketRouter.Router();

router.get('/connect', function(req, res) {
	pagesService.getRootPageId()
		.then(function(pageId) {
			res.status(200).send({ uId: req.socket.mazenet.uId, rootPageId: pageId });
		})
		.catch(CustomErrors.NotFoundError, function(err) {
			err.status = 404;
			next();
		});
});

function middleware(socket, next) {
	var uId = usersService.userConnected(socket.id);
	socket.mazenet = { uId: uId };
	socket.on('disconnect', function() {
		usersService.userDisconnected(socket.id);
	});
	next();
};

module.exports = { router: router, middleware: middleware };
