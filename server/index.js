var config = require('config');
var appPort = config.get('port');
var mazenetServer = require('./server');

mazenetServer.start(appPort);
