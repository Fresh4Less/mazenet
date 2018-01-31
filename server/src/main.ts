import * as Minimist from 'minimist';

import { Server } from './server';

let commandLine = Minimist(process.argv.slice(2));
let options: Partial<Server.Options> = {
    port: parseInt(commandLine.port),
    securePort: parseInt(commandLine.securePort),
    sslCertPath: commandLine.sllCert
};

options = {};


let server = new Server(options);
server.start();

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
