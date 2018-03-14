import * as Minimist from 'minimist';

import { Server } from './server';
import { GlobalLogger, LoggerHandler } from './util/logger';

const commandLine = Minimist(process.argv.slice(2));

const options: Partial<Server.Options> = {
    port: parseInt(commandLine.port, 10),
    securePort: parseInt(commandLine.securePort, 10),
    sslCertPath: commandLine.sllCert,
};

options.port = (isNaN(options.port as number)) ? undefined : options.port;
options.securePort = (isNaN(options.securePort as number)) ? undefined : options.securePort;

// postgres options
if(commandLine.postgres) {
    options.postgres = {password: 'mz-db-pass'};
}

// enable logs based on command line args
GlobalLogger.handlers.forEach((handler: LoggerHandler, level: string) => {
    // capitalize level name - 'logInfo', etc.
    const optName = 'log' + level.charAt(0).toUpperCase() + level.slice(1);
    let enabled = commandLine[optName];
    // set flag iflogAll is set and this level is not explicitly disabled
    if(commandLine.logAll && enabled !== false) {
        enabled = true;
    }

    // only change from default ifflag set
    if(enabled != null) {
        handler.enabled = enabled;
    }
});

const server = new Server(options);
server.start().subscribe(() => {
});
