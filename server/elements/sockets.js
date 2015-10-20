var sockets = require('../sockets');
var elementsService = require('./service');

var Validator = require('fresh-validation').Validator;
var CustomErrors = require('../util/custom-errors');
var ValidatorErrors = require('fresh-validation').Errors;

var mazenetIo = sockets.getIo().of('/mazenet');
mazenetIo.on('connection', function(socket) {
	socket.on('pages/elements/create', function(params) {
		//elementsService.createElement(params)
			//.then(function(page) {
				//socket.emit('pages/get:success', page);
			//})
			//.catch(ValidatorErrors.ValidationError, function(err) {
				//err.status = 400;
				//socket.emit('pages/get:failure', err);
			//})
			//.catch(CustomErrors.NotFoundError, function(err) {
				//err.status = 404;
				//socket.emit('pages/get:failure', err);
			//});
	};
});

