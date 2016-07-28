var config = require('config');
var Promise = require('bluebird');
var MongoDb = require('mongodb');
var CustomErrors = require('../util/custom-errors');
var db = require('../util/db');
var MongoClient = MongoDb.MongoClient;
Promise.promisifyAll(MongoDb);
Promise.promisifyAll(MongoClient);

function getPage(pageId) {
	return db.getMazenetDb()
		.then(function(db) {
			return db.collection('pages')
				.find({ "_id" : new MongoDb.ObjectID(pageId) }).limit(1).nextAsync();
		})
		.then(function(page) {
			if(!page) {
				throw new CustomErrors.NotFoundError('Page ' + pageId + ' not found.');
			}

			return db.convertAllObjectIdToString(page);
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
				console.error('failed insert');
				console.error(page);
			}
			return db.convertAllObjectIdToString(page.ops[0]);
		});
}

function getRootPageId() {
	return db.getMazenetDb()
		.then(function(db) {
			return db.collection('pages')
				.find({ "isRoot" : true }, {'_id': 1}).limit(1).nextAsync();
		})
		.then(function(page) {
			if(!page) {
				throw new CustomErrors.NotFoundError('Root page not found.');
			}
			return page._id.toHexString();
		});
}

function updatePage(pageId, pageParams) {
	return db.getMazenetDb()
		.then(function(db) {
			var flatParams = flattenObject(pageParams);
			var projectionParams = flattenObject(pageParams);
			projectionParams._id = 0;
			for (var p in projectionParams) {
				if(projectionParams.hasOwnProperty(p)) {
					projectionParams[p] = 1;
				}
			}
			return db.collection('pages')
				.findOneAndUpdateAsync(
					{ '_id': new MongoDb.ObjectID(pageId)},
					{ $set: flatParams},
					{ projection: projectionParams, returnOriginal: false });
		})
		.then(function(page) {
			if(!page || !page.ok || page.value === null) {
				//throw CustomErrors.
				//TODO: proper handling
				console.error('failed update');
				console.error(page);
				throw new CustomErrors.NotFoundError('Update page failed: could not find pageId ' + pageId);
			}
			return db.convertAllObjectIdToString(page.value);
		});
}

function flattenObject(obj) {
	var retObj = {};
	
	for (var p in obj) {
		if(!obj.hasOwnProperty(p)) {
			continue;
		}
		if(typeof obj[p] === 'object') {
			var flatObject = flattenObject(obj[p]);
			for (var p2 in flatObject) {
				if(!flatObject.hasOwnProperty(p2)) {
					continue;
				}
				retObj[p + '.' + p2] = flatObject[p2];
			}
		} else {
			retObj[p] = obj[p];
		}
	}
	return retObj;
}

module.exports = {
	getPage: getPage,
	createPage: createPage,
	getRootPageId: getRootPageId,
	updatePage: updatePage
};
