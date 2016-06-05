var BPromise = require('bluebird');
var MongoDb = require('mongodb');
var CustomErrors = require('../util/custom-errors');
var db = require('../util/db');
var MongoClient = MongoDb.MongoClient;
BPromise.promisifyAll(MongoDb);
BPromise.promisifyAll(MongoClient);

function getElement(pageId, elementId) {
	return db.getMazenetDb()
		.then(function(db) {
			return db.collection('pages')
				.find({ '_id': pageId }).limit(1)
				.project({ elements: { $elemMatch: { eId: new MongoDb.ObjectID(elementId) } } })
				.nextAsync();
		})
		.then(function(element) {
			if(!element) {
				throw new CustomErrors.NotFoundError('Page ' + pageId + ' or element ' + elementId + ' not found.');
			}
			return element;
		});
}

function createElement(pageId, elementParams) {
	elementParams._id = new MongoDb.ObjectID();
	return db.getMazenetDb()
		.then(function(db) {
			return db.collection('pages')
				.findOneAndUpdateAsync(
					{ '_id': pageId},
					{ $push: { elements: elementParams } },
					{ projection: { elements: { $elemMatch: { _id: elementParams._id } } }, returnOriginal: false });
		})
		.then(function(page) {
			if(!page || !page.ok || page.value === null) {
				//throw CustomErrors.
				//TODO: proper handling
				console.log('failed update');
				console.log(page);
				throw new CustomErrors.NotFoundError('Create element failed: could not find pageId ' + pageId);
			}
			return page.value.elements[0];
		});
}

module.exports = {
	getElement: getElement,
	createElement: createElement
};
