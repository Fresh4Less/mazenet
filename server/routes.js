//routes.js
//note that, unlike most routes.js files, this one returns a constructor, not a router
var express = require('express');

var pagesRoutes = require('./pages/routes');

module.exports = initRouter;

/* options (object):
 *   - silent (bool): no output if truthy
 *   - loggerReqName (string): name of logger req property name
 */

function initRouter(options) {
	options = options || {};
	var router = express.Router();
	// allow CORS for the api routes
	router.use(function(req, res, next) {
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
		next();
	});

	router.use('/pages', pagesRoutes);

	router.use(function(err, req, res, next) {
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

	return router;
}

