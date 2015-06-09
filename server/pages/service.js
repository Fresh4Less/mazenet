var BPromise = require('bluebird');
var ObjectID = require('mongodb').ObjectID;
var CustomErrors = require('../util/custom-errors');

var pagesDataAccess = require('./dataAccess');

function getPage(pageId) {
	_validateGetPage(pageId);
	return pagesDataAccess.getPage(new ObjectID(pageId))
		.then(function(page) {
			return page;
		});
}

function createPage(pageParams) {
	try {
		_validateNewPage(pageParams);
	}
	catch(err) {
		return BPromise.reject(err);
	}
	//TODO: require a link be created on the parent page
	//TODO: create a link
	//TODO: emit socket event when a page is created
	var sanitizedPageParams = _sanitizePageParams(pageParams);
	return pagesDataAccess.createPage(sanitizedPageParams)
		.then(function(page) {
			return page;
		});
}

function _sanitizePageParams(pageParams) {
	var sanitized = {};
	
	function addObjectID(property, src, dest) {
		if(src.hasOwnProperty(property)) {
			dest[property] = new ObjectID(src[property]);
		}
	}
	
	//whitelist and sanitize
	addObjectID('parentPage', pageParams, sanitized);
	addObjectID('creator', pageParams, sanitized);
	if(pageParams.hasOwnProperty('creator')) {
		sanitized.owners = [new ObjectID(pageParams.creator)];
	}
	if(pageParams.hasOwnProperty('permissions')) {	
	sanitized.permissions = pageParams.permissions;
	}
	if(pageParams.hasOwnProperty('name')) {	
	sanitized.name = pageParams.name;
	}
	return sanitized;
}

function _validateGetPage(pageId) {
	var error = _validateObjectId(pageId);
	if(error !== null) {
		throw new CustomErrors.ValidationError('pageId ' + error);
	}
	return true;
}

//validation (move into own module?)
function _validateNewPage(pageParams) {
	var errors = [];
	if(!_pushNull(errors, 'Page parameters', pageParams)) {
		_pushNotNull(errors, 'parentPage', _validateObjectId(pageParams.parentPage, true));
		_pushNotNull(errors, 'creator', _validateObjectId(pageParams.creator, true));
		_pushNotNull(errors, 'permissions', _validatePagePermissions(pageParams.permissions, true));
		_pushNotNull(errors, 'name', _validateString(pageParams.name, true));
	}
	if(errors.length > 0) {
		throw new CustomErrors.ValidationError(errors.join(', '));
	}
	
	return true;
}

function _pushNull(arr, paramName, elem) {
	if(elem === undefined || elem === null) {
		arr.push(paramName + ' must be defined');
		return true;
	}
	return false;
}

function _pushNotNull(arr, paramName, elem) {
	if(elem !== undefined && elem !== null) {
		arr.push(paramName + ' ' + elem);
		return true;
	}
	return false;
}

//returns null if okay, otherwise returns the error message as a string
function _validateObjectId(objectId, required) {
	return _validateRequired(objectId, required) ||
		(ObjectID.isValid(objectId) ? null : 'must be a valid MongoDb objectID');
}

function _validatePagePermissions(permissions, required) {
	var validValues = ['none', 'links', 'all'];
	return _validateRequired(permissions, required) ||
		((validValues.indexOf(permissions) === -1) ?
			'must be one of the following values: ' + validValues.join(', ') : null );
}

function _validateString(str, required) {
	return _validateRequired(str, required) ||
		(typeof str === 'string' ? null : 'must be a string');
}

function _validateRequired(obj, required) {
	if((obj === undefined || obj === null) && required) {
		return 'is a required field';
	}
	return null;
}

module.exports = {
	getPage: getPage,
	createPage: createPage
};