var config = require('config');
var parseArgs = require('minimist');
var appPort = config.get('port');
var mazenetServer = require('./server');

mazenetServer.start(appPort, parseArgs(process.argv.slice(2)));
