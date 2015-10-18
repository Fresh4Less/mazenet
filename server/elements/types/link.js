//data: { pId: objectId, text: String }
var BPromise = require('bluebird');

var Validator = require('fresh-validation').Validator;
var validator = new Validator();

var pagesService = require('../../pages/service');
var elementsService = require('../service');
var elementsDataAccess = require('../dataAccess');

function create(pageId, linkParams) {
	var whitelistedDataProperties = { text: false };
	validator.is(linkParams, 'linkParams')
		.property('data').required().object()
			.property('text').required().string();
	try {
		validator.throwErrors();
	}
	catch(err) {
		return BPromise.reject(err);
	}

	var pageParams = {
			creator: linkParams.creator,
			permissions: 'all',
			title: linkParams.data.text,
			background: { type: 'color', data: { color: '#ffffff' } }
	};

	linkParams.editable = true;
	var targetPage;
	var newPage;
	return pagesService.getPage(pageId)
	.then(function(page) {
		targetPage = page;
		// TODO: validate element params before creating page
		return pagesService.createPage(pageParams);
	})
	.then(function(page) {
		newPage = page;
		var backLinkParams = deepClone(linkParams);
		backLinkParams.classes = ['backLink']; //TODO: fix this bc broken for some reason (puts null in array)
		backLinkParams.editable = false;
		backLinkParams.data.text = targetPage.title;
		backLinkParams.data.pId = pageId;
		return elementsService.buildElement(page._id, backLinkParams, whitelistedDataProperties);
	})
	.then(function(backLink) {
		linkParams.data.pId = newPage._id;
		return elementsService.buildElement(pageId, linkParams, whitelistedDataProperties);
	});
}

function deepClone(o) {
	if(typeof o !== 'object' || o === null) {
		return o;
	}
	
	var newObj = (o instanceof Array) ? [] : {};
	for(var p in o) {
		newObj[p] = deepClone(o[p]);
	}
	return newObj;
}

module.exports = {
	create: create
};

