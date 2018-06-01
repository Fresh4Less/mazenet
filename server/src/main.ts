import * as fs from 'fs';
import * as Minimist from 'minimist';
import * as Path from 'path';

import { Server } from './server';
import { GlobalLogger, LoggerHandler } from './util/logger';
import { GlobalTelemetryOptions } from './util/telemetry';

export class InvalidConfigurationError extends Error {
    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, InvalidConfigurationError.prototype);
    }
}

const commandLine = Minimist(process.argv.slice(2));

const configPath = commandLine.config || Path.join(__dirname, '..', '..', '..', 'config', 'config.json');
const configFile = readJsonFile(configPath);

const secretsPath = commandLine.secrets || Path.join(__dirname, '..', '..', '..', 'secrets', 'secrets.json');
const secrets = readJsonFile(secretsPath);

const configSources = [configFile, commandLine];

const logOptions = copyProperties(configSources, [
    'logAll',
    'logFatal',
    'logError',
    'logWarn',
    'logInfo',
    'logRequest',
    'logTrace',
    'logTelem',
    'logDiag',
]);

// enable/disable loggers
GlobalLogger.handlers.forEach((handler: LoggerHandler, level: string) => {
    // capitalize level name - 'logInfo', etc.
    const optName = 'log' + level.charAt(0).toUpperCase() + level.slice(1);
    let enabled = logOptions[optName];
    // set flag if logAll is set and this level is not explicitly disabled
    if(logOptions.logAll && enabled !== false) {
        enabled = true;
    }

    // only change from default if flag set
    if(enabled !== undefined) {
        handler.enabled = enabled;
    }
});

if(GlobalLogger.handlers.get('telem')!.enabled) {
    GlobalTelemetryOptions.enabled = true;
    const telemetryOptions = copyProperties(configSources, [
        'telemetry.args',
        'telemetry.returnValue',
    ]).telemetry;

    if(telemetryOptions) {
        setProperty(GlobalTelemetryOptions.defaultRecordOptions, 'args', telemetryOptions.args);
        setProperty(GlobalTelemetryOptions.defaultRecordOptions, 'returnValue', telemetryOptions.returnValue);
    }
}

// TODO: add telemetry config

const options = copyProperties(configSources, [
    'clientPath',
    'env',
    'port',
    'securePort',
    'sslCertPath',
]);

if(options.clientPath === undefined) {
    options.clientPath = Path.join(__dirname, '..', '..', '..', '..', 'client', 'build');
}

// set property doesn't assign undefined, which prevents Object.assign() from overwriting properties with undefined
setProperty(options, 'postgres', copyProperties(configSources, [
    'postgres.connectionString',
    'postgres.connectionTimeoutMillis',
    'postgres.database',
    'postgres.host',
    'postgres.idleTimeoutMillis',
    'postgres.max',
    'postgres.port',
    'postgres.ssl.ca',
    'postgres.ssl.cert',
    'postgres.ssl.key',
    'postgres.ssl.rejectUnauthorized',
    'postgres.user',
]).postgres);

if(options.postgres) {
    // TODO: use validation annotations and validate config types
    ['database', 'host', 'user'].forEach((prop) => {
        if(!options.postgres[prop]) {
            throw new InvalidConfigurationError(`postgres.${prop} is a required field when postgres is enabled`);
        }
    });
}

GlobalLogger.info('Loaded configuration', {
    config: Object.assign({}, logOptions, options),
    configPath
});

// load secrets
if(options.postgres) {
    const password = getProperty(secrets, ['postgres', options.postgres.user].join('.'));
    if(!password) {
        throw new InvalidConfigurationError(`credentials missing for postgres user '${options.postgres.user}. make sure your secrets file is set up'`);
    }

    options.postgres.password = password;
}

const server = new Server(options);
server.start().subscribe(() => {
});

/** make a new object and copy the listed properties from a set of objects. supports nested properties
 * @argument sources - input objects. values from earlier sources in the array can be overridden by later sources
 * @argument propertyNames - list of properties to copy. Nested properties are specified with dot notation ('a.b.c')
 */
function copyProperties(sources: any[], propertyNames: string[]): any {
    const sourcesReversed = sources.slice().reverse();
    return propertyNames.reduce((out, pName) => {
        for(const source of sourcesReversed) {
            const value = getProperty(source, pName);
            if(value !== undefined) {
                setProperty(out, pName, value);
                break;
            }
        }
        return out;
    }, {});
}

/** sets a property on an object. Supports nested properties, creates nested objects when necessary
 * @argument obj - root object
 * @argument propertyName - name of the property to set. Nested properties are specified with dot notation ('a.b.c')
 * @argument value - the value to set. if undefined, do nothing and don't create nested objects
 */
function setProperty(obj: any, propertyName: string, value: any): any {
    if(!obj) {
        return undefined;
    }

    const properties = propertyName.split('.');
    if(properties.length === 1) {
        obj[properties[0]] = value;
        return obj;
    }

    if(!obj[properties[0]]) {
        obj[properties[0]] = {};
    }
    return setProperty(obj[properties[0]], properties.slice(1).join('.'), value);
}

/** Gets a property from an object if it exists. Supports nested properties
 * @argument obj - root object
 * @argument propertyName - name of the property to retrieved. Nested properties are specified with dot notation ('a.b.c')
 */
function getProperty(obj: any, propertyName: string): any {
    if(!obj) {
        return undefined;
    }

    const properties = propertyName.split('.');
    const value = obj[properties[0]];
    if(properties.length === 1) {
        return value;
    }

    return getProperty(value, properties.slice(1).join('.'));
}

/** Try to read a file and parse it as JSON
 *  @argument path - path to the file
 */
function readJsonFile(path: string): any | undefined {
    try {
        const contents = fs.readFileSync(path);
        try {
            return JSON.parse(contents.toString());
        } catch(error) {
            throw new InvalidConfigurationError(`Failed to parse JSON file during initialization: '${path}'`);
        }
    } catch(error) {
        if(error instanceof InvalidConfigurationError) {
            throw error;
        }

        GlobalLogger.warn('Failed to read file during initialization', {path, error});
        return undefined;
    }
}
