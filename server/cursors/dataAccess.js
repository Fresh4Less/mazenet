var config = require('config');
var BPromise = require('bluebird');
var MongoDb = require('mongodb');
var CustomErrors = require('../util/custom-errors');
var db = require('../util/db');
var MongoClient = MongoDb.MongoClient;
BPromise.promisifyAll(MongoDb);
BPromise.promisifyAll(MongoClient);

function createCursor(pageId, cursorParams) {
	return db.getMazenetDb()
		.then(function(db) {
			return db.collection('pages')
				.findOneAndUpdateAsync(
					{ '_id': pageId},
					{ $push: { cursors: cursorParams } },
					{ projection: { cursors: { $slice: -1 } }, returnOriginal: false });
		})
		.then(function(page) {
			if(!page || !page.ok || page.value === null) {
				//throw CustomErrors.
				//TODO: proper handling
				console.log('failed update');
				console.log(page);
				throw new CustomErrors.NotFoundError('Add cursor failed: could not find pageId ' + pageId);
			}
			return page.value.cursors[0];
		});
}

module.exports = {
	createCursor: createCursor
};
