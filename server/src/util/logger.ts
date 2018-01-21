import * as JsonStringifySafe from 'json-stringify-safe';
/**
 * The logger lets you to log data to a target (stdout) in a specified format (json).
 * Each log has a "level" (e.g. info, warn, error) whose output can be toggled on/off, or use custom target or serializer
 * You can associate data with each level, which will automatically be included in the log.
 * You can dynamically add log levels, or extend the Logger class
 */

/**
 */
export interface LoggerOptions {
	includeTimestamp: boolean | string[]; // add timestamp middleware to all/no initial handlers, or specify an array of handler levels
	target?: LoggerTarget; // override default target for initial handlers
	serializer?: LoggerSerializer; // override default serializer for initial handlers
}

export type LoggerTarget = {name: string, write: (serializedData: string) => void};
export type LoggerSerializer = {name: string, serialize: (data: object) => string};
export type LoggerMiddleware = (data: object) => object;

export interface LoggerHandler {
	target: LoggerTarget;
	serializer: LoggerSerializer;
	middleware: LoggerMiddleware[];
	enabled: boolean;
}

export class InvalidLoggerError extends Error {
	constructor(level: string) {
		super(`Missing log handler for level "{level}"`);
		Object.setPrototypeOf(this, InvalidLoggerError.prototype);
	}
}

// targets
export let Target = {
	stdout: {
		name: 'stdout',
		write: function(serializedData: string): void {
			console.log(serializedData);
		}
	},
	stderr: {
		name: 'stderr',
		write: function(serializedData: string): void {
			console.error(serializedData);
		}
	}
}

// serializers
export let Serializer = {
	json: {
		name: 'json',
		serialize: function(data: any): string {
			return JsonStringifySafe(data);
		}
	}
}

export let Middleware = {
	addTimestamp: function(data: any): any {
		data.timestamp = new Date().toISOString();
		return data;
	}
}

/**
 *
 */
export class Logger {
	static readonly defaultOptions = {
		includeTimestamp: true
	};
	static readonly defaultHandlers = new Map<string, LoggerHandler>([
		['diag',  {target: Target.stdout, serializer: Serializer.json, middleware: [], enabled: false}],
		['trace', {target: Target.stdout, serializer: Serializer.json, middleware: [], enabled: false}],
		['info',  {target: Target.stdout, serializer: Serializer.json, middleware: [], enabled: true}],
		['warn',  {target: Target.stdout, serializer: Serializer.json, middleware: [], enabled: true}],
		['error', {target: Target.stdout, serializer: Serializer.json, middleware: [], enabled: true}],
		['fatal', {target: Target.stdout, serializer: Serializer.json, middleware: [], enabled: true}],
	]);

	options: LoggerOptions;
	handlers: Map<string, LoggerHandler>;

	constructor(options: Partial<LoggerOptions>) {
		this.options = Object.assign({}, Logger.defaultOptions, options);
		this.handlers = new Map();
		for(let item of Logger.defaultHandlers) {
			let handler = Object.assign({}, item[1]);
			// don't share middleware array
			handler.middleware = [];
			this.handlers.set(item[0], handler);
		}

		if(this.options.target) {
			for(let h of this.handlers) {
				h[1].target = this.options.target;
			}
		}

		if(this.options.serializer) {
			for(let h of this.handlers) {
				h[1].serializer = this.options.serializer;
			}
		}

		if(this.options.includeTimestamp === false) {
			this.options.includeTimestamp = [];
		}
		else if(this.options.includeTimestamp === true) {
			this.options.includeTimestamp = Array.from(this.handlers.keys());
		}

		(<string[]>this.options.includeTimestamp).forEach((level) => {
			let handler = this.handlers.get(level);

			if(handler) {
				handler.middleware.push(Middleware.addTimestamp);
			}
		});
	}

	logData(level: string, message: string, userData: object = {}): void {
		let handler = this.handlers.get(level);

		if(!handler) {
			throw new InvalidLoggerError(level);
		}

		if(!handler.enabled) {
			return;
		}

		let data:any = {
			level: level,
			message: message
		};

		Object.assign(data, userData);

		handler.middleware.forEach((middleware) => {
			data = middleware(data);
		});

		handler.target.write(handler.serializer.serialize(data));
	}

	// Log levels
	diag(message: string, userData?: object): void {
		this.logData('diag', message, userData);
	}
	
	trace(message: string, userData?: object): void {
		this.logData('trace', message, userData);
	}
	
	info(message: string, userData?: object): void {
		this.logData('info', message, userData);
	}

	warn(message: string, userData?: object): void {
		this.logData('warn', message, userData);
	}

	error(message: string, userData?: object): void {
		this.logData('error', message, userData);
	}

	fatal(message: string, userData?: object): void {
		this.logData('fatal', message, userData);
	}
}

export let GlobalLogger = new Logger({});
