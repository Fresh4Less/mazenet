/**
 * Logger
 * log data to a target (stdout) in a specified format (json).
 * Output from each level (info, warn, etc) can be toggled and configured with a custom target and serializer
 * Specify transformations that extend or modify the log (add timestamp)
 * Dynamically create new log levels, or extend the Logger class
 */

/* tslint:disable no-console */

import * as JsonStringifySafe from 'json-stringify-safe';

export interface LoggerOptions {
    /** Middleware for each log level
     * levels is an array of level names the middleware is applied to.
     * iflevels is true, it is applied to all levels
     */
    middleware: Array<{ mw: LoggerMiddleware, levels: true | string[] }>;
    target?: LoggerTarget;
    serializer?: LoggerSerializer;
}

/** Writes serialized log (e.g. json) to the target (e.g. stdout) */
export interface LoggerTarget { name: string; write: (serializedData: string) => void; }
/** Serializes log object to a string (e.g. json) */
export interface LoggerSerializer { name: string; serialize: (data: object) => string; }
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
    stderr: {
        name: 'stderr',
        write(serializedData: string): void {
            console.error(serializedData);
        }
    },
    stdout: {
        name: 'stdout',
        write(serializedData: string): void {

            console.log(serializedData);
        }
    },
};

/** Standard serializers */
export let Serializer = {
    json: {
        name: 'json',
        serialize(data: any): string {
            return JsonStringifySafe(data);
        }
    }
};

/** Standard middlewares */
export let Middleware = {
    timestamp(data: any): any {
        data.timestamp = new Date().toISOString();
        return data;
    },
    // not recursive
    fullError(data: any): any {
        Object.keys(data).forEach((p) => {
            const d = data[p];
            if(d instanceof Error) {
                // include these in log
                Object.defineProperty(d, 'message', {enumerable: true});
                Object.defineProperty(d, 'stack', {enumerable: true});
            }
        });

        if(data instanceof Error) {
            (data as any).errorType = data.constructor.name;
        }
        return data;
    },
    pid(data: any): any {
        data.pid = process.pid;
        return data;
    }

};

export class Logger {
    public static readonly defaultOptions = {
        middleware: [
            {mw: Middleware.timestamp, levels: true},
            {mw: Middleware.fullError, levels: true},
            {mw: Middleware.pid, levels: true},
        ]
    };

    public static readonly defaultHandler = {
        enabled: true,
        middleware: [],
        serializer: Serializer.json,
        target: Target.stdout,
    };

    public static readonly defaultHandlers = new Map<string, LoggerHandler>([
        ['diag', Object.assign({}, Logger.defaultHandler, {enabled: false})],
        ['telem', Object.assign({}, Logger.defaultHandler, {enabled: false})],
        ['request', Object.assign({}, Logger.defaultHandler, {enabled: false})],
        ['trace', Object.assign({}, Logger.defaultHandler, {enabled: false})],
        ['info', Logger.defaultHandler],
        ['warn', Logger.defaultHandler],
        ['error', Logger.defaultHandler],
        ['fatal', Logger.defaultHandler],
    ]);

    public handlers: Map<string, LoggerHandler>;

    protected options: LoggerOptions;

    constructor(options: Partial<LoggerOptions>) {
        this.options = Object.assign({}, Logger.defaultOptions, options);

        //copy default handlers
        this.handlers = new Map();
        for (const item of Logger.defaultHandlers) {
            const handler = Object.assign({}, item[1]);
            // don't share middleware array
            handler.middleware = handler.middleware.slice();
            this.handlers.set(item[0], handler);
        }

        if(this.options.target) {
            for (const h of this.handlers) {
                h[1].target = this.options.target;
            }
        }

        if(this.options.serializer) {
            for (const h of this.handlers) {
                h[1].serializer = this.options.serializer;
            }
        }

        this.options.middleware.forEach((mw) => {
            this.addMiddleware(mw.mw, mw.levels);
        });
    }

    /**
     * @param userData - custom properties to log
     */
    public logData(level: string, message: string, userData: object = {}): void {
        const handler = this.handlers.get(level);

        if(!handler) {
            throw new InvalidLoggerError(level);
        }

        if(!handler.enabled) {
            return;
        }

        let data: any = {
            level,
            message
        };

        Object.assign(data, userData);

        handler.middleware.forEach((middleware) => {
            data = middleware(data);
        });

        handler.target.write(handler.serializer.serialize(data));
    }

    // Log levels
    public diag(message: string, userData?: object): void {
        this.logData('diag', message, userData);
    }

    public trace(message: string, userData?: object): void {
        this.logData('trace', message, userData);
    }

    public request(message: string, userData?: object): void {
        this.logData('request', message, userData);
    }

    public telem(message: string, userData?: object): void {
        this.logData('telem', message, userData);
    }

    public info(message: string, userData?: object): void {
        this.logData('info', message, userData);
    }

    public warn(message: string, userData?: object): void {
        this.logData('warn', message, userData);
    }

    public error(message: string, userData?: object): void {
        this.logData('error', message, userData);
    }

    public fatal(message: string, userData?: object): void {
        this.logData('fatal', message, userData);
    }

    /**
     * @param levels - adds the middleware to handlers for all listed levels. iftrue, add to all handlers
     */
    public addMiddleware(middleware: LoggerMiddleware, levels: true | string[]) {
        if(levels === true) {
            levels = Array.from(this.handlers.keys());
        }

        (levels as string[]).forEach((level) => {
            const handler = this.handlers.get(level);
            if(handler) {
                handler.middleware.push(middleware);
            }
        });
    }

    public addLevel(name: string, handler: Partial<LoggerHandler>) {
        const h = Object.assign({}, Logger.defaultHandler, handler);
        if(!handler.middleware) {
            Logger.defaultOptions.middleware.forEach((mw) => {
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
