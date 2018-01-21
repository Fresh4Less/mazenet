import * as Minimist from "minimist";

import {Config} from './config';
import {Server} from './server';

let commandLine = Minimist(process.argv.slice(2));
let config: Partial<Config> = {
	port: parseInt(commandLine.port),
	secureRedirectPort: parseInt(commandLine.secureRedirectPort),
	sslCertPath: commandLine.sllCert
};

config = {};


let server = new Server(config);
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
