/**
 * Logger
 * log data to a target (stdout) in a specified format (json).
 * Output from each level (info, warn, etc) can be toggled and configured with a custom target and serializer
 * Specify transformations that extend or modify the log (add timestamp)
 * Dynamically create new log levels, or extend the Logger class
 */

import * as JsonStringifySafe from 'json-stringify-safe';

export interface LoggerOptions {
    /** Middleware for each log level
     * levels is an array of level names the middleware is applied to.
     * if levels is true, it is applied to all levels
     */
    middleware: { mw: LoggerMiddleware, levels: true | string[] }[];
    target?: LoggerTarget;
    serializer?: LoggerSerializer;
}

/** Writes serialized log (e.g. json) to the target (e.g. stdout) */
export type LoggerTarget = { name: string, write: (serializedData: string) => void };
/** Serializes log object to a string (e.g. json) */
export type LoggerSerializer = { name: string, serialize: (data: object) => string };
/** Transforms the log object.
 * The return value is piped through all the middlewares, then serialized and written to the target.
 */
export type LoggerMiddleware = (data: object) => object;

/** Describes how logs for a level are processed */
export interface LoggerHandler {
    target: LoggerTarget;
    serializer: LoggerSerializer;
    middleware: LoggerMiddleware[];
    enabled: boolean;
}

/** Standard targets */
export let Target = {
    stdout: {
        name: 'stdout',
        write: function (serializedData: string): void {
            console.log(serializedData);
        }
    },
    stderr: {
        name: 'stderr',
        write: function (serializedData: string): void {
            console.error(serializedData);
        }
    }
};

/** Standard serializers */
export let Serializer = {
    json: {
        name: 'json',
        serialize: function (data: any): string {
            return JsonStringifySafe(data);
        }
    }
};

/** Standard middlewares */
export let Middleware = {
    timestamp: function (data: any): any {
        data.timestamp = new Date().toISOString();
        return data;
    },
    // not recursive
    fullError: function (data: any): any {
        Object.keys(data).forEach((p) => {
            let d = data[p];
            if (d instanceof Error) {
                // include these in log
                Object.defineProperty(d, 'message', {enumerable: true});
                Object.defineProperty(d, 'stack', {enumerable: true});
            }
        });

        return data;
    },

};

export class Logger {
    static readonly defaultOptions = {
        middleware: [
            {mw: Middleware.timestamp, levels: true},
            {mw: Middleware.fullError, levels: true},
        ]
    };

    static readonly defaultHandler = {
        target: Target.stdout,
        serializer: Serializer.json,
        middleware: [],
        enabled: true
    };

    static readonly defaultHandlers = new Map<string, LoggerHandler>([
        ['diag', Object.assign({}, Logger.defaultHandler, {enabled: false})],
        ['trace', Object.assign({}, Logger.defaultHandler, {enabled: false})],
        ['info', Logger.defaultHandler],
        ['warn', Logger.defaultHandler],
        ['error', Logger.defaultHandler],
        ['fatal', Logger.defaultHandler],
    ]);

    protected options: LoggerOptions;
    handlers: Map<string, LoggerHandler>;

    constructor(options: Partial<LoggerOptions>) {
        this.options = Object.assign({}, Logger.defaultOptions, options);

        //copy default handlers
        this.handlers = new Map();
        for (let item of Logger.defaultHandlers) {
            let handler = Object.assign({}, item[1]);
            // don't share middleware array
            handler.middleware = handler.middleware.slice();
            this.handlers.set(item[0], handler);
        }

        if (this.options.target) {
            for (let h of this.handlers) {
                h[1].target = this.options.target;
            }
        }

        if (this.options.serializer) {
            for (let h of this.handlers) {
                h[1].serializer = this.options.serializer;
            }
        }

        this.options.middleware.forEach(mw => {
            this.addMiddleware(mw.mw, mw.levels);
        });
    }

    /**
     * @param userData - custom properties to log
     */
    logData(level: string, message: string, userData: object = {}): void {
        let handler = this.handlers.get(level);

        if (!handler) {
            throw new InvalidLoggerError(level);
        }

        if (!handler.enabled) {
            return;
        }

        let data: any = {
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

    /**
     * @param levels - adds the middleware to handlers for all listed levels. if true, add to all handlers
     */
    public addMiddleware(middleware: LoggerMiddleware, levels: true | string[]) {
        if (levels === true) {
            levels = Array.from(this.handlers.keys());
        }

        (<string[]>levels).forEach((level) => {
            let handler = this.handlers.get(level);
            if (handler) {
                handler.middleware.push(middleware);
            }
        });
    }

    public addLevel(name: string, handler: Partial<LoggerHandler>) {
        let h = Object.assign({}, Logger.defaultHandler, handler);
        if (!handler.middleware) {
            Logger.defaultOptions.middleware.forEach(mw => {
                h.middleware.push(mw.mw);
            });
        }
        this.handlers.set(name, h);
    }
}

export class InvalidLoggerError extends Error {
    constructor(level: string) {
        super(`Missing log handler for level "{level}"`);
        Object.setPrototypeOf(this, InvalidLoggerError.prototype);
    }
}

export let GlobalLogger = new Logger({});
