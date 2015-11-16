var BPromise = require('bluebird');
var ObjectID = require('mongodb').ObjectID;
var CustomErrors = require('../util/custom-errors');

var pagesDataAccess = require('./dataAccess');
var Validator = require('fresh-validation').Validator;

// initialze validator
var validator = new Validator();

//pages schema
// field names in parentheses () optional
//  creator: String (userId)
//  owner: Array String (userId)
//  permissions: String ('none', 'links', 'all')
//  title: String,
//  (whitelist): Array (userId)
//  background: object { bType: String, data: {...} },
//  elements: Array (see /elements/service)
//  cursors: Array { uId: String, frames: Array { pos: { x: int, y: int }, t: int } }

var permissionsValues = ['none', 'links', 'all'];
var backgroundTypes = ['color'];

function getPage(pageIdStr) {
	return BPromise.try(function() {
		validator.is(pageIdStr, 'pageId').required().objectId();
		validator.throwErrors();
		return pagesDataAccess.getPage(validator.transformationOutput());
	})
	.then(function(page) {
		return page;
	});
}

// isRoot marks this page as the root page. Be careful! There should only be one,
// and it should only be enabled for extremely privliaged connections (probably not externally at all)
function createPage(pageParams, isRoot) {
	return BPromise.try(function() {
		validator.is(pageParams, 'pageParams').required().object()
			.property('creator').required().objectId().back()
			.property('permissions').required().elementOf(permissionsValues).back()
			.property('title').required().string().back()
			.property('background').required().object()
			.property('bType').elementOf(backgroundTypes).back();
		validator.throwErrors();
		validator.whitelist({ creator: true, background: { data: true } });
		var sanitizedPageParams = validator.transformationOutput();
		sanitizedPageParams.owners = [sanitizedPageParams.creator];
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

module.exports = {
	getPage: getPage,
	createPage: createPage,
	getRootPageId: getRootPageId
};
