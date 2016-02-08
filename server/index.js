var express = require('express');
var app = express();
var server = require('http').Server(app);

var socketio = require('./sockets').listen(server);

var session = require('express-session');
var bodyParser = require('body-parser');
var compress = require('compression');

var config = require('config');
var appPort = config.get('port');

var routes = require('./routes');

var ObjectID = require('mongodb').ObjectID;
var Validator = require('fresh-validation').Validator;

var BPromise = require('bluebird');

// debug
BPromise.longStackTraces();

Validator.addGlobalValidator({
	name: 'objectId',
	continueOnFail: false,
	errorMessage: '{name} ({val}) must be an objectId',
	validationFunction: function(target) {
		//return target instanceof ObjectID || ObjectID.isValid(target);
		return target.toHexString || ObjectID.isValid(target); //TODO: make this not a hack
	},
	transformationFunction: function(target) {
		//if(target instanceof ObjectID) {
		if(target.toHexString) { //TODO: make this not a hack
			return target;
		}
		return new ObjectID(target);
	}
});

server.listen(appPort);
console.log('Listening on port ' + appPort);
//
//app.use(session({
//	secret: 'change this',
//	resave: false,
//	saveUninitialized: true
//}));

app.use(compress());
app.use(bodyParser.json());
app.use(routes);
app.use(express.static(__dirname + "/../client"));
app.use('/bower_components',express.static(__dirname + "/../bower_components"));


//var io = require('./sockets')(server);
/*
var ioIdCounter = 0;
var unsavedCursorData = {};

io.on('connection', function(socket)
{
	socket.uniqueId = ioIdCounter++;
	console.log('a user connected with id: ' + socket.uniqueId);
	socket.on('disconnect', function() {
		onUserExited(socket, socket.currentPage);
		console.log('user disconnected with id: ' + socket.uniqueId);
	});
	socket.on('getPage', function(pageId, response) {
	findPage(pageId, function(err, pageData) {
		if(err === null)
		{
			if(pageData !== null)
			{
				delete pageData._id;
				pageData.status = "success";
				var oldPageId = socket.currentPage;
				socket.leave(socket.rooms[0], function() {
				onUserExited(socket, oldPageId);
				socket.join(pageId, function () {
				socket.currentPage = socket.rooms[0];
				socket.broadcast.to(socket.currentPage).emit('userEntered', { "id" : socket.uniqueId });
				var roomSockets = io.sockets.adapter.rooms[pageId];
				var liveCursors = {};
				for(var i in roomSockets)
				{
					var currentSocket = io.sockets.connected[i];
					if(currentSocket.uniqueId !== socket.uniqueId)
					{
						var x = 0;
						var y = 0;
						if(unsavedCursorData.hasOwnProperty(currentSocket.uniqueId))
						{
							var cursorData = unsavedCursorData[currentSocket.uniqueId];
							if(cursorData.length >= 2)
							{
								x = cursorData[0];
								y = cursorData[1];
							}
						}
						liveCursors[currentSocket.uniqueId] = {"x" : x, "y" : y };
					}
				}
				pageData.liveCursors = liveCursors;
				response(pageData);
				});
				});
			}
			else
			{
				response({"status" : "error", "message" : "Page not found."});
			}
		}
		else
		{
			console.log("Failed to retreive page: " + err.message);
			response({"status" : "error", "message" : "Failed to retreive page."});
		}
		});
	});
	socket.on('createPage', function(pageParams, response) {
	createPage(pageParams, function(err, pageId) {
		if(err === null)
		{
			response({"status" : "success", "pageId" : pageId});
		}
		else
		{
			console.log("Failed to create page: " + err.message);
			response({"status" : "error", "message" : "Failed to create page."});
		}
		});
	});
	socket.on('addLink', function(linkParams, response) {
		addLink(socket.currentPage, linkParams, function(err) {
			if(err === null)
			{
				socket.broadcast.to(socket.currentPage).emit('addLink', linkParams);
				response({"status" : "success"});
			}
			else
				response({"status" : "error", "message" : "Failed to add link."});
		});
	});
	socket.on('mouseMoved', function(mouseParams, response) {
		if(socket.currentPage)
		{
			socket.volatile.broadcast.to(socket.currentPage).emit('otherMouseMoved',
				{ "id" : socket.uniqueId, "x" : mouseParams.x, "y" : mouseParams.y });
			if(!unsavedCursorData.hasOwnProperty(socket.uniqueId))
				unsavedCursorData[socket.uniqueId] = [];
			//positions are saved as an array [x1,y1,x2,y2,...]
			unsavedCursorData[socket.uniqueId].push(mouseParams.x, mouseParams.y );
		}
	});
	
});

function deleteAllPages()
{
	var pages = mazenetdb.collection('pages');
	pages.remove({ "_id" : { $ne: new ObjectID("54b726e40f786c2f0b7a58ed") }}, function(err, numberRemoved) {
		console.log('Deleted all pages: ' + numberRemoved + ' removed.');
	});
}

function resetSavedCursors()
{
	var pages = mazenetdb.collection('pages');
	pages.update({}, { "$set" : { "cursors" : [] }}, {multi: true}, function(err, doc) {
		console.log('Cleared out cursors');
	});
}

function onUserExited(socket, room)
{
	if(!ObjectID.isValid(room))
	{
		return;
	}
	socket.broadcast.to(room).emit('userExited', {"id" : socket.uniqueId});
	//save recorded cursor movement to database
	if(!unsavedCursorData.hasOwnProperty(socket.uniqueId) || unsavedCursorData.hasOwnProperty(socket.uniqueId).length === 0)
		return;
	var cursorFrames = unsavedCursorData[socket.uniqueId].slice(0);
	unsavedCursorData[socket.uniqueId] = [];
	//[ {frames:[ {x:x,y:y}] } ]
	var pages = mazenetdb.collection("pages");
	pages.update( { "_id" : new ObjectID(room) }, { $push : { "cursors" : { "frames" : cursorFrames } } }, function(err, doc) {
		if(err !== null)
			console.log("failed to add cursor data: " + err.message);
	});
}

function addLink(pageId, linkParams, callback)
{
	var pages = mazenetdb.collection("pages");
	pages.update( { "_id" : new ObjectID(pageId) }, { $push : { "links" : linkParams } }, function(err, result)
		{
		if(err !== null)
		{
			callback(err);
			return;
		}
		callback(null);
		});
}

function createPage(pageParams, callback)
{
	var pages = mazenetdb.collection("pages");
	pages.insert( { "name" : pageParams.name ,
					"backgroundColor" : pageParams.backgroundColor,
					"links" : pageParams.links },
		function(err, result)
		{
		if(err !== null)
		{
			callback(err);
			return;
		}
		callback(null, result[0]._id);
		});
}

function findPage(pageId, callback)
{
	var pages = mazenetdb.collection("pages");
	pages.findOne( { "_id" : new ObjectID(pageId) },
		function(err, doc)
		{
		if(err !== null)
		{
			callback(err);
			return;
		}
		callback(null, doc);
		});
}


*/
