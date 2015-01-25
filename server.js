var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var session = require('express-session');
var bodyParser = require('body-parser');
var compress = require('compression');
var mongo = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

var mongoUrl = 'mongodb://localhost:27017/mazenet';
server.listen(8090);

app.use(session({
	secret: 'change this',
	resave: false,
	saveUninitialized: true
}));

app.use(compress());
app.use(bodyParser.json());
app.use(express.static("."));

var mazenetdb = null;
mongo.connect(mongoUrl, function(err, db) {
	if(err === null)
	{
		mazenetdb = db;
	}
	else
	{
		console.log(err);
	}
});

app.get('/', function(req, res)
{
	//test sessions between http requests
	if(req.session.hasOwnProperty('views'))
	{
		res.end('' + (++req.session.views));
	}
	else
	{
		req.session.views = 1;
		res.send('' + req.session.views);
	}
});

app.get('/pages/:pageId', function(req, res) {
	findPage(req.param('pageId'), function(err, pageData) {
		if(err === null)
		{
			if(pageData !== null)
			{
				delete pageData._id;
				res.status(200).json(pageData);
			}
			else
			{
				res.status(404).send("Page not found.");
			}
		}
		else
		{
			console.log("Failed to retreive page: " + err.message);
			res.status(500).send("Failed to retreive page.");
		}
	});
});

app.post('/pages', function(req, res) {
	if(!hasAllParams(req.body, ['name', 'backgroundColor']))
	{
		res.status(400).send("Bad request.");
		return;
	}
	
	createPage(req.body, function(err, pageId) {
		if(err === null)
		{
			res.status(201).json({ "pageId" : pageId});
		}
		else
		{
			console.log("Failed to create page: " + err.message);
			res.status(400).send("Failed to create page.");
		}
	});
});

var ioIdCounter = 0;
var unsavedCursorData = {};

io.on('connection', function(socket)
{
	socket.uniqueId = ioIdCounter++;
	console.log('a user connected with id: ' + socket.uniqueId);
	socket.on('disconnect', function() {
		onUserExited(socket, socket.rooms[0]);
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
				var oldPageId = socket.rooms[0];
				socket.leave(socket.rooms[0], function() {
				onUserExited(socket, oldPageId);
				socket.join(pageId, function () {
				socket.broadcast.to(socket.rooms[0]).emit('userEntered', { "id" : socket.uniqueId });
				var roomSockets = io.sockets.adapter.rooms[pageId];
				var liveCursors = {};
				for(var i in roomSockets)
				{
					var currentSocket = io.sockets.connected[i];
					if(currentSocket.uniqueId !== socket.uniqueId)
						liveCursors[currentSocket.uniqueId] = {"x" : "0%", "y" : "0%" };
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
		addLink(socket.rooms[0], linkParams, function(err) {
			if(err === null)
			{
				socket.broadcast.to(socket.rooms[0]).emit('addLink', linkParams);
				response({"status" : "success"});
			}
			else
				response({"status" : "error", "message" : "Failed to add link."});
		});
	});
	socket.on('mouseMoved', function(mouseParams, response) {
		if(socket.rooms[0])
		{
			socket.volatile.broadcast.to(socket.rooms[0]).emit('otherMouseMoved',
				{ "id" : socket.uniqueId, "x" : mouseParams.x, "y" : mouseParams.y });
			if(!unsavedCursorData.hasOwnProperty(socket.uniqueId))
				unsavedCursorData[socket.uniqueId] = [];
			
			unsavedCursorData[socket.uniqueId].push({ "x" : mouseParams.x, "y" : mouseParams.y });
		}
	});
	
});

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

function hasAllParams(obj, params)
{
	for(var i = 0; i < params.length; i++)
	{
		if(!obj.hasOwnProperty(params[i]))
			return false;
	}
	return true;
}

