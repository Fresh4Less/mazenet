#!/usr/bin/env node
var readline = require('readline');
var colors = require('colors');

var levelColors = {
	info: 'bold',
	warn: 'yellow',
	error: 'red',
};

let inStream = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	terminal: false
});

inStream.on('line', function(line) {
	try {
		var log = JSON.parse(line);
		// we don't care about some fields when pretty printing
		delete log.pid;
		var output = '';
		if(log.message) {
			output += log.message;
		}
		if(log.level) {
			output = '[' + log.level + '] ' + output;
			var color = levelColors[log.level];
			if(color) {
				// color the level name and message
				output = output[color];
			}
		}
		// prefix with dim timestamp
		if(log.timestamp) {
			output = ('[' + log.timestamp + ']').dim + output;
		}

		// add the other fields as formatted json
		delete log.level;
		delete log.message;
		delete log.timestamp;
		if(Object.keys(log).length > 0) {
			output += '\n' + JSON.stringify(log, null, 4);
		}
		console.log(output);
	}
	catch(err) {
		console.log(line);
	}
});
