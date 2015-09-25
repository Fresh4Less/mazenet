//pages/routes.js
var express = require('express');
var router = express.Router();

var CustomErrors = require('../util/custom-errors');

var pagesService = require('./service');

var elementsRouter = require('../elements/routes');

router.use('/:pageId/elements', elementsRouter);

router.get('/:pageId', function(req, res, next) {
	pagesService.getPage(req.params.pageId)
		.then(function(page) {
			res.status(200).json(page);
		})
		.catch(CustomErrors.NotFoundError, function(err) {
			err.status = 404;
			next(err);
		});
});

/*
router.post('/', function(req, res, next) {
//TODO: VALDATE OWNER IDENTITY!!!
	pagesService.createPage(req.body)
		.then(function(page) {
			res.status(201).json(page);
		})
		.catch(CustomErrors.ValidationError, function(err) {
			err.status = 400;
			next(err);
		});
});
*/
module.exports = router;