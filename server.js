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
server.listen(8094);

app.use(session({
	secret: 'change this',
	resave: false,
	saveUninitialized: true
}));

app.use(compress());
app.use(bodyParser.json());
app.use(express.static("."));

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

io.on('connection', function(socket)
{
	socket.uniqueId = ioIdCounter++;
	console.log('a user connected with id: ' + socket.uniqueId);
	socket.on('disconnect', function() {
		socket.broadcast.to(socket.rooms[0]).emit('userExited', {"id" : socket.uniqueId});
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
				socket.leave(socket.rooms[0], function() {
				socket.broadcast.to(socket.rooms[0]).emit('userExited', {"id" : socket.uniqueId});
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
	socket.on('mouseMoved', function(mouseParams, response) {
		if(socket.rooms[0])
		socket.volatile.broadcast.to(socket.rooms[0]).emit('otherMouseMoved', 
			{ "id" : socket.uniqueId, "x" : mouseParams.x, "y" : mouseParams.y });
	});
	
});



function createPage(pageParams, callback)
{
	mongo.connect(mongoUrl, function(err, db) {
	if(err !== null)
	{
		callback(err);
		return;
	}
	var pages = db.collection("pages");
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
		db.close();
		callback(null, result[0]._id);
		});
	});
}

function findPage(pageId, callback)
{
	mongo.connect(mongoUrl, function(err, db) {
	if(err !== null)
	{
		callback(err);
		return;
	}
	var pages = db.collection("pages");
	try
	{
	pages.findOne( { "_id" : new ObjectID(pageId) },
		function(err, doc)
		{
		if(err !== null)
		{
			callback(err);
			return;
		}
		db.close();
		callback(null, doc);
		});
	}
	catch(e)
	{
		callback(e);
	}
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

