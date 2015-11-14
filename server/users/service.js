var ObjectID = require('mongodb').ObjectID;

var connectedUsers = {};

// TODO: implement login!
function userConnected(socketId) {
	// generate a mongo ObjectID for this user
	var uId = new ObjectID();
	connectedUsers[socketId] = uId;
	return uId;
}

function userDisconnected(socketId) {
	var uId = connectedUsers[socketId];
	delete connectedUsers[socketId];
	return uId;
}

function getUId(socketId) {
	return connectedUsers[socketId];
}

module.exports = {
	userConnected: userConnected,
	userDisconnected: userDisconnected,
	getUId: getUId
};

