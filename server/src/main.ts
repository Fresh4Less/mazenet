import * as Minimist from 'minimist';

import { Server } from './server';
import { GlobalLogger, LoggerHandler } from './util/logger';

let commandLine = Minimist(process.argv.slice(2));
let options: Partial<Server.Options> = {
    port: parseInt(commandLine.port, 10) || undefined,
    securePort: parseInt(commandLine.securePort, 10) || undefined,
    sslCertPath: commandLine.sllCert
}

GlobalLogger.handlers.forEach((handler: LoggerHandler, level: string) => {
    // capitalize level name - 'logInfo', etc.
    let optName = 'log' + level.charAt(0).toUpperCase() + level.slice(1);
    let enabled = commandLine[optName];
    // set flag if logAll is set and this level is not explicitly disabled
    if(commandLine.logAll && enabled !== false) {
        enabled = true;
    }

    // only change from default if flag set
    if(enabled != null) {
        handler.enabled = enabled;
    }
});


let server = new Server(options);
server.start().subscribe(() => {
});

/*
var path = require('path');
var config = require('config');
var parseArgs = require('minimist');
var server = require('./server');

var configOptions = {
	port: config.get('port'),
	insecurePort: config.get('insecurePort'),
	sslCertPath: config.get('sslCertPath'),
	jwtCertPath: config.get('jwtCertPath'),
	logLevel: config.get('logLevel'),
};

server.start(Object.assign({}, configOptions, parseArgs(process.argv.slice(2))));
 */
