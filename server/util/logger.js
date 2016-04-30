var safeJsonStringify = require('safe-json-stringify');
var os = require('os');

module.exports = logger;

function logger(options) {

	if(options === undefined) {
		options = {};
	}
	setDefault(options, 'name', 'logger');
	setDefault(options, 'hostname', os.hostname());
	setDefault(options, 'pid', process.pid);
	setDefault(options, 'stream', process.stdout);
	setDefault(options, 'level', 'info');
	setDefault(options, 'reqName', 'freshLogger');

	return function logger(req, res, next) {
		if(req[options.reqName] === undefined) {
			req[options.reqName] = {};
		}

		var startTime = new Date();
		res.on('finish', function() {
			var logData = req[options.reqName];
			setDefault(logData, 'time', startTime);
			setDefault(logData, 'responseTime', new Date() - startTime);
			setDefault(logData, 'name', options.name);
			setDefault(logData, 'hostname', options.hostname);
			setDefault(logData, 'pid', options.pid);
			if(req) {
				setDefault(logData, 'req', {
					method: req.method,
					url: req.originalUrl || req.url,
					headers: req.headers,
					ip: req.ip
				});
			}
			if(res && res.statusCode) {
				setDefault(logData, 'status', res.statusCode);
			}
			options.stream.write(safeJsonStringify(logData) + '\n','utf8');
		});

		next();
	};
}

function setDefault(obj, property, value) {
	if(obj[property] === undefined) {
		obj[property] = value;
	}
	return obj;
}
