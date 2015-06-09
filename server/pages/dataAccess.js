//pages schema
// field names in parentheses () optional
//	parentPage: ObjectId
//  creator: String (userId)
//  owner: Array String (userId)
//  permissions: String ('none', 'links', 'all')
//	name: String,
//  (whitelist): Array (userId)
//	background: object { type: String, ... },
//			types: 'color': { color: String }
//	elements: Array { type: String, position: { x: int, y: int }, ... }
//	cursors: Array { userId: String, frames: Array { position: { x: int, y: int }, time: int } }

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

function getPage(pageId) {
	return getMazenetDb()
		.then(function(db) {
			return db.collection('pages')
				.findOneAsync({ "_id" : new MongoDb.ObjectID(pageId) });	
		})
		.then(function(page) {
			if(!page) {
				throw new CustomErrors.NotFoundError('Page ' + pageId + ' not found.');
			}
			return page;
		});
}

function createPage(pageParams) {
	return getMazenetDb()
		.then(function(db) {
			return db.collection('pages')
				.insertOneAsync(pageParams);
		})
		.then(function(page) {
			if(!page || !page.result || !page.result.ok) {
				//throw CustomErrors.
				//TODO: proper handling
				console.log('failed insert');
				console.log(page);
			}
			return page.ops[0];
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
	getPage: getPage,
	createPage: createPage
};