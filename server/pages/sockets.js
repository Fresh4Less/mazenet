var pagesService = require('./service');

var CustomErrors = require('../util/custom-errors');
var ValidatorErrors = require('fresh-validation').Errors;

function registerHandlers(route, io) {
	io.on('connection', function(socket) {
		socket.on(route + '/enter', function(pageId) {
			pagesService.getPage(pageId)
				.then(function(page) {
					socket.rooms.forEach(function(r) {
						console.log(r);
						console.log(typeof r);
					});
					socket.join(route + '/' + page._id);
					console.log('joined pages/' + page._id);
					socket.emit('pages/enter:success', page);
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
	});
}

module.exports = {
	registerHandlers: registerHandlers
};

