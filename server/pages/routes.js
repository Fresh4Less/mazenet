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
	resetAllPages()
		.then(function(page) {
			res.status(201).json(page);
		});
});

function resetAllPages() {
	var BPromise = require('bluebird');
	var MongoDb = require('mongodb');
	var db = require('../util/db');
	var elementsService = require('../elements/service');
	var MongoClient = MongoDb.MongoClient;
	BPromise.promisifyAll(MongoDb);
	BPromise.promisifyAll(MongoClient);

	var mainPage;
	return db.getMazenetDb()
		.then(function(db) {
			return db.collection('pages')
				.deleteManyAsync({});
		})
		.then(function() {
			var initialPage = {
			  "creator": "101010101010101010101010",
			  "permissions": "all",
			  "title": "mazenet",
			  "background" : { "bType" : "color", "data" : { "color" : "#ffffff" } }
			};
			return pagesService.createPage(initialPage, true);
		})
		.then(function(page) {
			mainPage = page;
			var initialLink = {
				"eType": "link",
				"creator": "101010101010101010101010",
				"pos": {"x": 50, "y": 50},
				"data": { "text": "enter mazenet" }
			};
			return elementsService.createElement(page._id, initialLink);
		})
		.then(function() {
			return pagesService.getPage(mainPage._id);
		});
}

module.exports = router;
