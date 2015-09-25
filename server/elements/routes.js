//elements/routes.js
var express = require('express');
var router = express.Router();

var CustomErrors = require('../util/custom-errors');

var elementsService = require('./service');

router.post('/', function(req, res, next) {
	var pageId = req.params.pageId;
	elementsService.createElement(pageId, req.body)
		.then(function(elements) {
			res.status(201).json(elements);
		})
		.catch(CustomErrors.NotFoundError, function(err) {
			err.status = 404;
			next(err);
		})
		.catch(CustomErrors.ValidationError, function(err) {
			err.status = 400;
			next(err);
		});
});

router.get('/:elementId', function(req, res, next) {
	
});

module.exports = router;