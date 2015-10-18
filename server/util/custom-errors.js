function _createError(name) {
	var error = function(message) {
		this.message = message;
		this.stack = (new Error()).stack;
	};
	error.prototype = new Error();
	error.prototype.name = name;	
	return error;
}

module.exports = {
	NotFoundError: _createError('NotFoundError'),
};

