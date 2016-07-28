var config = require('config');
var BPromise = require('bluebird');
var MongoDb = require('mongodb');
var CustomErrors = require('../util/custom-errors');
var MongoClient = MongoDb.MongoClient;
BPromise.promisifyAll(MongoDb);
BPromise.promisifyAll(MongoClient);

var dbConfig = config.get('dbConfig');

var selectedDb = 'dev';
var mazenetDb = null;

function connect(dbName) {
	if(mazenetDb) {
		console.warn('Already connected to mazenetDb');
		mazenetDb.close();
	}
	return MongoClient.connectAsync('mongodb://' + dbConfig.host + ':' + dbConfig.port + '/' + dbConfig.dbName)
		.then(function(db) {
			mazenetDb = db;
			return db;
		});
}
function getMazenetDb() {
	if(!mazenetDb) {
		return connect(selectedDb);
	}
	else {
		return BPromise.resolve(mazenetDb);
	}
}

function convertAllObjectIdToString(obj) {
	for (var p in obj) {
		if(!obj.hasOwnProperty(p)) {
			continue;
		}
		//hacky way to detect ObjectId
		if(obj[p].toHexString) {
			obj[p] = obj[p].toHexString();
		}
		else if(typeof obj[p] === 'object') {
			convertAllObjectIdToString(obj[p]);
		}
	}
	return obj;
}

module.exports = {
	connect: connect,
	getMazenetDb: getMazenetDb,
	convertAllObjectIdToString: convertAllObjectIdToString
};

