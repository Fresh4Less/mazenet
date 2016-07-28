var Promise = require('bluebird');
var ObjectID = require('mongodb').ObjectID;
var CustomErrors = require('../util/custom-errors');

var pagesDataAccess = require('./dataAccess');
var Validator = require('fresh-validation').Validator;

//for resetAllPages
var db = require('../util/db');
var elementsService = require('../elements/service');

// initialze validator
var validator = new Validator();

//pages schema
// field names in parentheses () optional
//  creator: String (userId)
//  owners: Array String (userId)
//  permissions: String ('none', 'links', 'all')
//  title: String,
//  (whitelist): Array (userId)
//  background: object { bType: String, data: {...} },
//  elements: Array (see /elements/service)
//  cursors: Array { uId: String, frames: Array { pos: { x: int, y: int }, t: int } }

var permissionsValues = ['none', 'links', 'all'];
var backgroundTypes = ['color'];

function getPage(pageId) {
	return Promise.try(function() {
		validator.throwErrors();
		return pagesDataAccess.getPage(pageId);
	})
	.then(function(page) {
		return page;
	});
}

// isRoot marks this page as the root page. Be careful! There should only be one,
// and it should only be enabled for extremely privliaged connections (probably not externally at all)
function createPage(pageParams, isRoot) {
	return Promise.try(function() {
		validator.is(pageParams, 'pageParams').required().object()
			.property('creator').required().objectId().back()
			.property('permissions').required().elementOf(permissionsValues).back()
			.property('title').required().string().back()
			.property('background').required().object()
				.property('bType').required().elementOf(backgroundTypes).back();
		validator.throwErrors();
		validator.whitelist({ creator: true, background: { data: true } });
		var sanitizedPageParams = validator.transformationOutput();
		sanitizedPageParams.creator = new ObjectID(sanitizedPageParams.creator);

		sanitizedPageParams.owners = [sanitizedPageParams.creator];
		sanitizedPageParams.cursors = [];
		if(isRoot) {
			sanitizedPageParams.isRoot = true;
		}
		return pagesDataAccess.createPage(sanitizedPageParams);
	})
	.then(function(page) {
		return page;
	});
}

function getRootPageId() {
	return pagesDataAccess.getRootPageId();
}

function updatePage(pageId, pageParams) {
	return Promise.try(function() {
		validator.is(pageId, 'pageId').required().objectId();
		validator.is(pageParams, 'pageParams').required().object()
			.property('permissions').not.required().elementOf(permissionsValues).back()
			.property('title').not.required().string().back()
			.property('background').not.required().object()
				.property('bType').not.required().elementOf(backgroundTypes).back()
			.back()
			.property('owners').not.required().array();
		validator.throwErrors();
		//TODO: validate data properly
		//TODO: validate owners properly
		validator.whitelist({background: { data: true } });
		var sanitizedPageParams = validator.transformationOutput();
		if(sanitizedPageParams.owners) {
			sanitizedPageParams.owners = sanitizedPageParams.map(function(owner) {
				return new ObjectID(owner);
			});
		}
		return pagesDataAccess.updatePage(pageId, sanitizedPageParams);
	})
	.then(function(page) {
		return page;
	});
}

// debugging service. be very careful
function resetAllPages() {
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
			return createPage(initialPage, true);
		})
		.then(function(page) {
			mainPage = page;
			var initialLinkPublic = {
				"eType": "link",
				"pos": {"x": 0.5, "y": 0.5},
				"data": { "text": "enter mazenet" }
			};
			var initialLinkPrivate = {
				"creator": "101010101010101010101010",
			};
			return elementsService.createElement(page._id, initialLinkPublic, initialLinkPrivate);
		})
		.then(function() {
			return getPage(mainPage._id);
		});
}

module.exports = {
	getPage: getPage,
	createPage: createPage,
	getRootPageId: getRootPageId,
	updatePage: updatePage,
	resetAllPages: resetAllPages
};
