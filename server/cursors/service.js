var BPromise = require('bluebird');
var ObjectID = require('mongodb').ObjectID;
var CustomErrors = require('../util/custom-errors');

var cursorsDataAccess = require('./dataAccess');
var Validator = require('fresh-validation').Validator;

// initialze validator
var validator = new Validator();

var activeCursors = {}; // pageIdStr: { uIdStr: { cursor data } }

function createActiveCursor(pageIdStr, uIdStr, position) {
	validator.is(pageIdStr, 'pageId').required().objectId();
	validator.is(uIdStr, 'uId').required().objectId();
	var uId = validator.transformationOutput();
	validator.is(position, 'position').required().object()
			.property('x').required().number().back()
			.property('y').required().number().back();
	validator.throwErrors();
	if(activeCursors[pageIdStr] === undefined) {
		activeCursors[pageIdStr] = {};
	}
	if(activeCursors[pageIdStr][uIdStr] !== undefined) {
		console.warn('cursors/service: createActiveCursor: Cursor already exists: ' + uIdStr + '. Overwriting.');
	}
	activeCursors[pageIdStr][uIdStr] = { uId: uId, frames: [{ pos: position, t: 0 }] };
}

function addActiveFrame(pageIdStr, uIdStr, frame) {
	var pageObj = activeCursors[pageIdStr];
	if(pageObj === undefined) {
		console.error('cursors/service: addActiveCursor: No active cursors on page: ' + pageIdStr);
		return;
	}
	var cursorObj = pageObj[uIdStr];
	if(pageObj === undefined) {
		console.error('cursors/service: addActiveCursor: No active cursor on page: ' + pageIdStr + ' with uId ' + uIdStr);
		return;
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
function commitActiveCursor(pageIdStr, uIdStr) {
	return BPromise.try(function() {
		validator.is(pageIdStr, 'pageId').required().objectId();
		var pageId = validator.transformationOutput();
		validator.is(uIdStr, 'userId').required().objectId();
		var pageObj = activeCursors[pageIdStr];
		if(pageObj === undefined) {
			console.error('cursors/service: commitActiveCursor: No active cursors on page: ' + pageIdStr);
			return;
		}
		var cursorObj = pageObj[uIdStr];
		if(pageObj === undefined) {
			console.error('cursors/service: commitActiveCursor: No active cursor on page: ' + pageIdStr + ' with uId ' + uIdStr);
			return;
		}
		delete pageObj[uIdStr];
		return cursorsDataAccess.createCursor(pageId, cursorObj);
	});
}

// returns an object with userIds mapped to {x: curX, y: curY}
function getActiveCursors(pageIdStr) {
	validator.is(pageIdStr, 'pageId').required().objectId();
	validator.throwErrors();
	var pageCursors = [];
	var pageObj = activeCursors[pageIdStr];
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

function createCursor(pageIdStr, cursorParams) {
	return BPromise.try(function() {
		validator.is(pageIdStr, 'pageId').required().objectId();
		var pageId = validator.transformationOutput();
		validator.is(cursorParams, 'cursorParams').required().object()
			.property('uId').required().objectId().back()
			.property('frames').required().array();//.foreach()
		validator.throwErrors();
		validator.whitelist();
		return cursorsDataAccess.createCursor(pageId, validator.transformationOutput());
	});
}

module.exports = {
	createCursor: createCursor,
	createActiveCursor: createActiveCursor,
	addActiveFrame: addActiveFrame,
	commitActiveCursor: commitActiveCursor,
	getActiveCursors: getActiveCursors
};
