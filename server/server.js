var express = require('express');
var http = require('http');
var sockets = require('./sockets');

var session = require('express-session');
var bodyParser = require('body-parser');
var compress = require('compression');

var routes = require('./routes');

var ObjectID = require('mongodb').ObjectID;
var Validator = require('fresh-validation').Validator;

var BPromise = require('bluebird');

var logger = require('./util/logger');

var path = require('path');

Validator.addGlobalValidator({
	name: 'objectId',
	continueOnFail: false,
	errorMessage: '{name} ({val}) must be an objectId',
	validationFunction: function(target) {
		//return target instanceof ObjectID || ObjectID.isValid(target);
		return target.toHexString || ObjectID.isValid(target); //TODO: make this not a hack
	},
	transformationFunction: function(target) {
		//if(target instanceof ObjectID) {
		if(target.toHexString) { //TODO: make this not a hack
			return target;
		}
		return new ObjectID(target);
	}
});

// debug
BPromise.longStackTraces();

var app;
var server;
var socketServer;
var prod;
function start(appPort, options) {
	var opts = Object.create(options || null);

	var loggerReqName = 'freshLogger';
	if(opts.logLevel === undefined) {
		opts.logLevel = 'info';
	}
	prod = process.env.NODE_ENV === 'production';

	app = express();
	server = http.Server(app);
	socketServer = sockets.listen(server, { loggerReqName: loggerReqName, logLevel: opts.logLevel});

	//
	//app.use(session({
	//	secret: 'change this',
	//	resave: false,
	//	saveUninitialized: true
	//}));

	app.use(compress());
	app.use(bodyParser.json());

	if(prod) {
		app.get('/main.js', function(req, res, next) {
			res.sendFile(path.resolve("client/main-prod.js"));
		} );
	}

	app.use(express.static(__dirname + "/../client"));

	app.use('/bower_components', express.static(__dirname + "/../bower_components"));
	app.use(logger({name: 'mazenet-api-http', reqName: loggerReqName, level: opts.logLevel }));
	app.use(routes({ loggerReqName: loggerReqName}));

	server.listen(appPort);
	console.log('Listening on port ' + appPort);
}

function close() {
	if(server) {
		server.close();
		app = null;
		server = null;
		socketServer = null;
	}
}

module.exports = {
	start: start,
	close: close
};
