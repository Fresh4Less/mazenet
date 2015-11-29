//pages/routes.js
var express = require('express');
var router = express.Router();

var CustomErrors = require('../util/custom-errors');
var ValidatorErrors = require('fresh-validation').Errors;

var pagesService = require('./service');

var elementsRouter = require('../elements/routes');

router.use('/:pageId/elements', elementsRouter);

router.get('/:pageId', function(req, res, next) {
	pagesService.getPage(req.params.pageId)
		.then(function(page) {
			res.status(200).json(page);
		})
		.catch(ValidatorErrors.ValidationError, function(err) {
			err.status = 400;
			next(err);
		})
		.catch(CustomErrors.NotFoundError, function(err) {
			err.status = 404;
			next(err);
		});
});

// DEBUG ROUTES
router.post('/', function(req, res, next) {
	pagesService.createPage(req.body)
		.then(function(page) {
			res.status(201).json(page);
		})
		.catch(ValidatorErrors.ValidationError, function(err) {
			err.status = 400;
			next(err);
		});
});

router.post('/reset', function(req, res, next) {
	pagesService.resetAllPages()
		.then(function(page) {
			res.status(201).json(page);
		});
});

module.exports = router;
