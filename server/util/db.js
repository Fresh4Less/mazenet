var config = require('config');
var BPromise = require('bluebird');
var MongoDb = require('mongodb');
var CustomErrors = require('../util/custom-errors');
var MongoClient = MongoDb.MongoClient;
BPromise.promisifyAll(MongoDb);
BPromise.promisifyAll(MongoClient);

var dbConfig = config.get('dbConfig');

var mazenetDb = null;

function connect() {
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
		return connect();
	}
	else {
		return BPromise.resolve(mazenetDb);
	}
}

module.exports = {
	connect: connect,
	getMazenetDb: getMazenetDb
};

