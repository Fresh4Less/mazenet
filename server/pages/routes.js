//pages/routes.js
var express = require('express');
var router = express.Router();

var CustomErrors = require('../util/custom-errors');

var pagesService = require('./service');

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

router.post('/', function(req, res, next) {
//TODO: VALDATE OWNER IDENTITY!!!
	var pageParams = {
		parentPage: req.body.parentPage,
		creator: req.body.creator,
		permissions: req.body.permissions,
		name: req.body.name
	};
	pagesService.createPage(pageParams)
		.then(function(page) {
			res.status(201).json(page);
		})
		.catch(CustomErrors.ValidationError, function(err) {
			err.status = 400;
			next(err);
		});
});

//function hasAllParams(obj, params)
//{
//	for(var i = 0; i < params.length; i++)
//	{
//		if(!obj.hasOwnProperty(params[i])) {
//			return false;
//		}
//	}
//	return true;
//}


module.exports = router;