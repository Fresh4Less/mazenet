var config = require('config');
var BPromise = require('bluebird');
var MongoDb = require('mongodb');
var CustomErrors = require('../util/custom-errors');
var db = require('../util/db');
var MongoClient = MongoDb.MongoClient;
BPromise.promisifyAll(MongoDb);
BPromise.promisifyAll(MongoClient);

function getPage(pageId) {
	return db.getMazenetDb()
		.then(function(db) {
			return db.collection('pages')
				.find({ "_id" : pageId }).limit(1).nextAsync();
		})
		.then(function(page) {
			if(!page) {
				throw new CustomErrors.NotFoundError('Page ' + pageId + ' not found.');
			}
			return page;
		});
}

function createPage(pageParams) {
	return db.getMazenetDb()
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

module.exports = {
	getPage: getPage,
	createPage: createPage
};
