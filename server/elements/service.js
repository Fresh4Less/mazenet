var BPromise = require('bluebird');

var Validator = require('fresh-validation').Validator;
var validator = new Validator();

var elementsDataAccess = require('./dataAccess');

// element schema {
//    _id: objectId,
//    creator: objectId
//    eType: String,
//    editable: boolean
//    pos: { x: int, y: int },
//    classes: [String],
//    data: {...}
// }

var elementTypes = null;

function createElement(pageIdStr, elementParams) {
	if(!elementTypes) {
		elementTypes = {
			link: require('./types/link').create
		};
	}
	validator.is(pageIdStr, 'pageId').required().objectId();
	var pageId = validator.transformationOutput();
	validator.is(elementParams, 'elementParams').required().object()
		.property('eType').required().string().elementOf(elementTypes);
	try {
		validator.throwErrors();
	}
	catch(err) {
		return BPromise.reject(err);
	}

	return elementTypes[elementParams.eType](pageId, elementParams)
		.then(function(element) {
			return element;
		});
}

function buildElement(pageIdStr, elementParams, whitelistedDataProperties) {
	validator.is(pageIdStr, 'pageId').required().objectId();
	var pageId = validator.transformationOutput();
	validator.is(elementParams, 'elementParams')
		.property('eType').required().string().back()
		.property('creator').required().objectId().back()
		.property('pos').required().object()
			.property('x').required().number().back()
			.property('y').required().number().back()
		.back()
		.property('classes').not.required().array()
		.property('editable').not.required();
	try {
		validator.throwErrors();
	}
	catch(err) {
		return BPromise.reject(err);
	}
	
	validator.whitelist({ creator: true, data: whitelistedDataProperties });
	var sanitizedElementParams = validator.transformationOutput();
	return elementsDataAccess.createElement(pageId, sanitizedElementParams)
		.then(function(element) {
			return element;
		});
}

module.exports = {
	buildElement: buildElement,
	createElement: createElement
};

