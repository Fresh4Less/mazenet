//data: { pId: objectId, text: String, isReturnLink: boolean }
var Promise = require('bluebird');
var ObjectID = require('mongodb').ObjectID;

var Validator = require('fresh-validation').Validator;
var validator = new Validator();

var pagesService = require('../../pages/service');
var elementsService = require('../service');

var whitelistedPublicDataProperties = {
	text: false
};

var whitelistedPrivateDataProperties = {
	isReturnLink: false
};

// if no pId is provided, we need to create a new page for this link to point to
// if isReturnLink !== true, we need to make a return link on the page
function create(pageId, baseElement, publicParams, privateParams) {
	return Promise.try(function() {
		validator.is(publicParams.data, 'publicLinkData').required().object()
			.property('text').required().string();

		validator.whitelist(whitelistedPublicDataProperties);
		var sanitizedPublicData = validator.transformationOutput();

		validator.is(privateParams.data, 'privateLinkData').not.required().object()
			.property('pId').not.required().objectId();
			//.property('isReturnLink').not.required().boolean()
			//TODO: update this validation once there is "boolean" validation in fresh-validation

		validator.throwErrors();
		validator.whitelist(whitelistedPrivateDataProperties);
		var sanitizedPrivateData = validator.transformationOutput();

		// defaults
		if(sanitizedPrivateData === undefined) {
			sanitizedPrivateData = {};
		}

		if(sanitizedPrivateData.pId !== undefined) {
			sanitizedPrivateData.pId = new ObjectID(sanitizedPrivateData.pId);
		}

		//TODO: remove this once there is boolean validation
		if(sanitizedPrivateData.isReturnLink !== undefined) {
			sanitizedPrivateData.isReturnLink = !!sanitizedPrivateData.isReturnLink;
		}
		else {
			sanitizedPrivateData.isReturnLink = false;
		}

		// assertion: you cannot make a return link without a pId
		if(sanitizedPrivateData.isReturnLink && sanitizedPrivateData.pId === undefined) {
			return Promise.reject(new Error('elements: link: create: Creating a return link without specifying pId is not allowed.'));
		}
		
		// there are 3 steps to creating a link (create page, create return link,
		// create this link) but sometimes we only need to do step 3 or steps 2 and 3
		// to deal with this, we create a resolved promise, then attach the needed
		// steps as "then" calls as we go.
		var promise = Promise.resolve();
		if(sanitizedPrivateData.pId === undefined) {
			// make the page
			var backgroundColor = RGBtoHex(HSVtoRGB(Math.floor(Math.random() * 50) / 50, 0.5, 0.95));
			var pageParams = {
				creator: baseElement.creator.toHexString(),
				permissions: 'all',
				title: sanitizedPublicData.text,
				background: { bType: 'color', data: { color: backgroundColor } }
			};

			promise = promise.then(function() {
				return pagesService.createPage(pageParams);
			}).then(function(page) {
				sanitizedPrivateData.pId = new ObjectID(page._id);
			});
		}
		if(sanitizedPrivateData.isReturnLink !== true) {
			// make a return link
			promise = promise.then(function() {
				return pagesService.getPage(pageId);
			}).then(function(currentPage) {
				var returnLinkPublicParams = deepClone(publicParams);

				returnLinkPublicParams.data = {
					text: currentPage.title
				};

				var returnLinkPrivateParams = deepClone(privateParams);
				returnLinkPrivateParams.creator = privateParams.creator.toHexString();
				returnLinkPrivateParams.editable = false;
				returnLinkPrivateParams.data = {
					pId: pageId,
					isReturnLink: true
				};

				return elementsService.createElement(sanitizedPrivateData.pId.toHexString(), returnLinkPublicParams, returnLinkPrivateParams);
			});
		}

		return promise.then(function() {
			// finally, merge the public and private data fields and add them to the base element
			baseElement.data = [sanitizedPublicData, sanitizedPrivateData].reduce(function(base, obj) {
				Object.keys(obj).forEach(function(key) {
						base[key] = obj[key];
				});
				return base;
			}, {});
			return baseElement;
		});
	});
}

function deepClone(o) {
	if(typeof o !== 'object' || o === null) {
		return o;
	}

	var newObj = (o instanceof Array) ? [] : {};
	for(var p in o) {
		newObj[p] = deepClone(o[p]);
	}
	return newObj;
}
/* accepts parameters
 * h  Object = {h:x, s:y, v:z}
 * OR 
 * h, s, v
 */
function HSVtoRGB(h, s, v) 
{
	var r, g, b, i, f, p, q, t;
	if (h && s === undefined && v === undefined) {
		s = h.s; v = h.v; h = h.h;
	}
	i = Math.floor(h * 6);
	f = h * 6 - i;
	p = v * (1 - s);
	q = v * (1 - f * s);
	t = v * (1 - (1 - f) * s);
	switch (i % 6) {
		case 0: r = v; g = t; b = p; break;
		case 1: r = q; g = v; b = p; break;
		case 2: r = p; g = v; b = t; break;
		case 3: r = p; g = q; b = v; break;
		case 4: r = t; g = p; b = v; break;
		case 5: r = v; g = p; b = q; break;
	}
	return {
		r: Math.floor(r * 255),
		g: Math.floor(g * 255),
		b: Math.floor(b * 255)
	};
}

//0-255
function RGBtoHex(r, g, b)
{
	if(r && g === undefined && b === undefined) {
		g = r.g; b = r.b; r = r.r;
	}
	var decColor = (r << 16) + (g << 8) + b;
	return "#" + decColor.toString(16);
}

module.exports = {
	create: create
};

