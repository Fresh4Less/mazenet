var Promise = require('bluebird');
var ObjectID = require('mongodb').ObjectID;
var CustomErrors = require('../util/custom-errors');

var cursorsDataAccess = require('./dataAccess');
var Validator = require('fresh-validation').Validator;

// initialze validator
var validator = new Validator();

var activeCursors = {}; // pageId: { uId: { cursor data } }

function createActiveCursor(pageId, uId, position) {
	validator.is(pageId, 'pageId').required().objectId();
	validator.is(uId, 'uId').required().objectId();
	validator.is(position, 'position').required().object()
			.property('x').required().number().back()
			.property('y').required().number().back();
	validator.throwErrors();
	if(activeCursors[pageId] === undefined) {
		activeCursors[pageId] = {};
	}
	if(activeCursors[pageId][uId] !== undefined) {
		console.warn('cursors/service: createActiveCursor: Cursor already exists: ' + uId + '. Overwriting.');
	}
	activeCursors[pageId][uId] = { uId: new ObjectID(uId), frames: [{ pos: position, t: 0 }] };
}

function addActiveFrame(pageId, uId, frame) {
	var pageObj = activeCursors[pageId];
	if(pageObj === undefined) {
		throw new Error('cursors/service: addActiveCursor: No active cursors on page: ' + pageId);
	}
	var cursorObj = pageObj[uId];
	if(pageObj === undefined) {
		throw new Error('cursors/service: addActiveCursor: No active cursor on page: ' + pageId + ' with uId ' + uId);
	}
	validator.is(frame, 'frame').required().object()
		.property('pos').required().object()
			.property('x').required().number().back()
			.property('y').required().number().back()
		.back()
		.property('t').required().number();
	validator.throwErrors();
	validator.whitelist();
	var sanitizedFrame = validator.transformationOutput();
	cursorObj.frames.push(sanitizedFrame);
}

// commits the active cursor to the database and deletes it
function commitActiveCursor(pageId, uId) {
	return Promise.try(function() {
		validator.is(pageId, 'pageId').required().objectId();
		validator.is(uId, 'userId').required().objectId();
		validator.throwErrors();
		var pageObj = activeCursors[pageId];
		if(pageObj === undefined) {
			throw new Error('cursors/service: commitActiveCursor: No active cursors on page: ' + pageId);
		}
		var cursorObj = pageObj[uId];
		if(pageObj === undefined) {
			throw new Error('cursors/service: commitActiveCursor: No active cursor on page: ' + pageId + ' with uId ' + uId);
		}
		delete pageObj[uId];
		return cursorsDataAccess.createCursor(pageId, cursorObj);
	});
}

// returns an object with userIds mapped to {x: curX, y: curY}
function getActiveCursors(pageId) {
	validator.is(pageId, 'pageId').required().objectId();
	validator.throwErrors();
	var pageCursors = [];
	var pageObj = activeCursors[pageId];
	// copy each userId and its last frame position
	for (var userId in pageObj) {
		if (pageObj.hasOwnProperty(userId)) {
			var userObj = pageObj[userId];
			var lastFrame = userObj.frames[userObj.frames.length - 1];
			pageCursors.push({ uId: userId, pos: { x: lastFrame.pos.x, y: lastFrame.pos.y }});
		}
	}
	return pageCursors;
}

function createCursor(pageId, cursorParams) {
	return Promise.try(function() {
		validator.is(pageId, 'pageId').required().objectId();
		validator.is(cursorParams, 'cursorParams').required().object()
			.property('uId').required().objectId().back()
			.property('frames').required().array();//.foreach()
		validator.throwErrors();
		validator.whitelist();
		var sanitizedCursorParams = validator.transformationOutput();
		sanitizedCursorParams.uId = new ObjectID(sanitizedCursorParams.uId);
		return cursorsDataAccess.createCursor(pageId, sanitizedCursorParams);
	});
}

module.exports = {
	createCursor: createCursor,
	createActiveCursor: createActiveCursor,
	addActiveFrame: addActiveFrame,
	commitActiveCursor: commitActiveCursor,
	getActiveCursors: getActiveCursors
};
