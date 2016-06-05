//elements/routes.js
var express = require('express');
var router = express.Router({mergeParams: true});

var CustomErrors = require('../util/custom-errors');
var ValidatorErrors = require('fresh-validation').Errors;

var elementsService = require('./service');

//router.get('/:elementId', function(req, res, next) {
	//var pageId = req.params.pageId;
	//var elementId = req.params.elementId;
	//elementsService.getElement(pageId, elementId)
		//.then(function(element) {
		//});
//});

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
		.catch(ValidatorErrors.ValidationError, function(err) {
			err.status = 400;
			next(err);
		});
});

module.exports = router;
