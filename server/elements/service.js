var Promise = require('bluebird');
var ObjectID = require('mongodb').ObjectID;

var Validator = require('fresh-validation').Validator;
var validator = new Validator();

var elementsDataAccess = require('./dataAccess');

// element schema {
//    _id: objectId,
//    creator: objectId
//    eType: String,
//    editable: boolean
//    pos: { x: int, y: int },
//    data: {...}
// }

// lazily initialized in createElement, in case there are circular requires
// (e.g. elements that create other elements)
var elementTypes = null;

// createElement
// Creates a base element, whitelisting allowed fields and the entire data object
// Passes this element to an element "initializer" based on eType
// An element initializer must be a function with the signature:
//       Promise<Element> function(options)
// options is an object with the following fields:
//   - pageId {ObjectId}: the page this element is being created on
//   - baseElement {Object}: an object initialized with the standard element parameters.
//                  Most elements will only need to attach a "data" object to this
//   - publicParams {Object}: the public element parameters (can be set by external API)
//   - privateParams {Object}: the private element parameters (only set internally)
// Returns: A promise to a fully constructed element object. This is passed
//          to the database as-is, without validation.
// The element initializer is responsible for validating its data fields
//
// Parameters:
//   createElement whitelists the data field--element constructors are expected to 
//   publicElementParams can be set by external APIs
//   privateElementParams are internal fields that should never be set to external data
// Returns a promise to a complete element entry.
function createElement(pageId, publicElementParams, privateElementParams) {
	return Promise.try(function() {
		if(!elementTypes) {
			elementTypes = {
				// register element constructors here
				link: require('./types/link').create
			};
		}

		// validate public parameters
		validator.is(pageId, 'pageId').required().objectId();
		validator.is(publicElementParams, 'publicElementParams').required().object()
			.property('eType').required().string().elementOf(elementTypes).back()
			.property('pos').required().object()
				.property('x').required().number().back()
				.property('y').required().number().back()
			.back();

		validator.whitelist({ data: true });
		var sanitizedPublicElementParams = validator.transformationOutput();

		// validate private parameters
		validator.is(privateElementParams, 'privateElementParams').required().object()
			.property('creator').required().objectId().back()
			.property('editable').not.required().back();

		validator.throwErrors();
		validator.whitelist({ data: true });
		var sanitizedPrivateElementParams = validator.transformationOutput();
		sanitizedPrivateElementParams.creator = new ObjectID(sanitizedPrivateElementParams.creator);

		// default values
		if(sanitizedPrivateElementParams.editable === undefined) {
			sanitizedPrivateElementParams.editable = true;
		}

		// merge public and private parameters into the baseElement (ignoring data)
		var baseElement = [sanitizedPublicElementParams, sanitizedPrivateElementParams].reduce(function(base, obj) {
			Object.keys(obj).forEach(function(key) {
				if(key !== 'data') {
					base[key] = obj[key];
				}
			});
			return base;
		}, {});

		// call element initializer
		return elementTypes[sanitizedPublicElementParams.eType](
				pageId,
				baseElement,
				sanitizedPublicElementParams,
				sanitizedPrivateElementParams
		).then(function(element) {
			return elementsDataAccess.createElement(pageId, element);
		});
	});
}

module.exports = {
	createElement: createElement
};

