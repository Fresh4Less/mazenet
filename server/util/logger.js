var safeJsonStringify = require('safe-json-stringify');
var os = require('os');

var logLevels = ['info', 'error', 'none']; //selecting a level will print that level and all AFTER it

module.exports = logger;

function logger(options) {

	var opts = Object.create(options || null);

	setDefault(opts, 'name', 'logger');
	setDefault(opts, 'hostname', os.hostname());
	setDefault(opts, 'pid', process.pid);
	setDefault(opts, 'stream', process.stdout);
	setDefault(opts, 'level', 'info'); //level we are listening to
	setDefault(opts, 'defaultLevel', 'info'); //default level things are logged to
	setDefault(opts, 'reqName', 'freshLogger');

	return function logger(req, res, next) {
		if(req[opts.reqName] === undefined) {
			req[opts.reqName] = {};
		}

		if(opts.ignoreResponse) {
			//immediately log. used if we are getting an old request that is already done without access to the response
			var logData = req[opts.reqName];
			setDefault(logData, 'time', startTime);
			setDefault(logData, 'name', opts.name);
			setDefault(logData, 'hostname', opts.hostname);
			setDefault(logData, 'pid', opts.pid);
			setDefault(logData, 'level', opts.defaultLevel);
			if(req) {
				setDefault(logData, 'req', {
					method: req.method,
					url: req.originalUrl || req.url,
					headers: req.headers,
					ip: req.ip
				});
			}
			if(logData.error) {
				logData.level = 'error';
			}
			logJson(logData, opts.level, opts.stream, 'utf8');
		}
		else {
			var startTime = new Date();
			res.on('finish', function() {
				var logData = req[opts.reqName];
				setDefault(logData, 'time', startTime);
				setDefault(logData, 'responseTime', new Date() - startTime);
				setDefault(logData, 'name', opts.name);
				setDefault(logData, 'hostname', opts.hostname);
				setDefault(logData, 'pid', opts.pid);
				setDefault(logData, 'level', opts.defaultLevel);
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
				if(logData.error) {
					logData.level = 'error';
				}
				logJson(logData, opts.level, opts.stream, 'utf8');
			});
		}

		next();
	};
}

function setDefault(obj, property, value) {
	if(obj[property] === undefined) {
		obj[property] = value;
	}
	return obj;
}

function logJson(data, level, stream, encoding) {
	var levelIndex = logLevels.indexOf(level);
	if(levelIndex !== -1 && levelIndex <= logLevels.indexOf(data.level)) {
		stream.write(safeJsonStringify(data) + '\n', encoding);
	}
}
