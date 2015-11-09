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
//  cursors: Array { uId: String, frames: Array { position: { x: int, y: int }, time: int } }

var permissionsValues = ['none', 'links', 'all'];
var backgroundTypes = ['color'];

function getPage(pageIdStr) {
	validator.is(pageIdStr, 'pageId').required().objectId();
	try {
		validator.throwErrors();
	}
	catch(err) {
		return BPromise.reject(err);
	}
	return pagesDataAccess.getPage(validator.transformationOutput())
		.then(function(page) {
			return page;
		});
}

function createPage(pageParams) {
	validator.is(pageParams, 'pageParams').required().object()
		.property('creator').required().objectId().back()
		.property('permissions').required().elementOf(permissionsValues).back()
		.property('title').required().string().back()
		.property('background').required().object()
			.property('bType').elementOf(backgroundTypes).back();
	try {
		validator.throwErrors();
	}
	catch(err) {
		return BPromise.reject(err);
	}
	
	validator.whitelist({ creator: true, background: { data: true } });
	var sanitizedPageParams = validator.transformationOutput();
	sanitizedPageParams.owners = [sanitizedPageParams.creator];
	return pagesDataAccess.createPage(sanitizedPageParams)
		.then(function(page) {
			return page;
		});
}

module.exports = {
	getPage: getPage,
	createPage: createPage
};
