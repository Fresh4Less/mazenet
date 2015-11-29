var expect = require('chai').expect;
var sinon = require('sinon');

var socketClient = require('socket.io-client');

var socketOptions ={
  transports: ['websocket'],
  'force new connection': true
};

var config = require('config');
var appPort = config.get('port');

var server = require('../../../server/server');
var pagesService = require('../../../server/pages/service');
var db = require('../../../server/util/db');

var connectUrl = 'http://127.0.0.1:8090/mazenet';
var sockets = [];

describe('pages', function() {
	beforeEach(function() {
		server.close();
		return pagesService.resetAllPages()
		.then(function() {
			server.start(appPort);
			sockets = [];
		});
	});
	it('should notify a client of their uId and the root page', function(done) {
		sockets.push(socketClient(connectUrl, socketOptions));
		sockets.push(socketClient(connectUrl, socketOptions));
		sockets.push(socketClient(connectUrl, socketOptions));
		var connectCount = 0;

		sockets.forEach(function(socket) {
			socket.on('users/connected', function(userData) {
				expect(userData.uId).to.be.a('string');
				expect(userData.rootPageId).to.be.a('string');
				connectCount++;
				if(connectCount == 3) {
					done();
				}
			});
			socket.on('users/connected:failure', function(error) {
				done(error);
			});
		});
	});

	it('should give a valid rootPageId that can be entered', function(done) {
		sockets.push(socketClient(connectUrl, socketOptions));
		sockets.push(socketClient(connectUrl, socketOptions));
		sockets.push(socketClient(connectUrl, socketOptions));

		var enterCount = 0;
		sockets.forEach(function(socket) {
			socket.on('users/connected', function(userData) {
				expect(userData.rootPageId).to.be.a('string');
				socket.emit('pages/enter', { pId: userData.rootPageId, pos: {x: 50, y: 50}});
			});
			socket.on('pages/enter:success', function(page) {
				expect(page.page).to.be.an('object');
				expect(page.users).to.have.length(enterCount);
				enterCount++;
				if(enterCount == 3) {
					done();
				}
			});
			socket.on('pages/enter:failure', function(error) {
				done(error);
			});
		});
	});
});
//socket.on('users/connected', function(userData) {
		//console.log('connected');
		//console.log(userData);
		//rootPageId = userData.rootPageId;
		//socket.emit('pages/enter', { pId: rootPageId, pos: { x: 50, y: 50 }});
		//socket.emit('pages/cursors/moved', { pos: { x: 10, y: 10}, t: 10});
		//socket.emit('pages/cursors/moved', { pos: { x: 20, y: 30}, t: 20});
		//socket.emit('pages/elements/create', {
			//"eType": "link",
			//"creator": "101010101010101010101010",
			//"pos": {
			//"x": 40,
			//"y": 40
			//},
			//"data": {
			//"text": "my link!"
			//}
			//});
		//socket.emit('pages/update', {
			//permissions: "links",
			//title: "updated title",
			//"background" : { "data" : { "color" : "#aaffaa" } },
			//owners: ['101010101010101010101010']});
		//});
//socket.on('users/connected:failure', function(err) {
		//console.log('failed connected');
		//console.log(err);
		//});
//socket.on('pages/enter:success', function(page) {
		//console.log('entered page');
		//console.log(page);
		//});
//socket.on('pages/enter:failure', function(error) {
		//console.log('enter page failed');
		//console.log(error);
		//});
//socket.on('pages/elements/created', function(element) {
		//console.log('element created');
		//console.log(element);
		//});
//socket.on('pages/elements/create:failure', function(error) {
		//console.log('create element failed');
		//console.log(error);
		//});
//socket.on('pages/updated', function(pageChanges) {
		//console.log('page updated');
		//console.log(pageChanges);
		//});
//socket.on('pages/update:failure', function(error) {
		//console.log('update page failed');
		//console.log(error);
		//});
//socket.on('pages/userEntered', function(user) {
		//console.log('user entered');
		//console.log(user);
		//});
//socket.on('pages/userLeft', function(user) {
		//console.log('user left');
		//console.log(user);
		//});
//socket.on('pages/cursors/moved', function(cursor) {
		//console.log('user moved cursor');
		//console.log(cursor);
		//});
//  socket.on('pages/cursors/created', function(cursor) {
//		  console.log('cursor created');
//		  console.log(cursor);
//		  });
//  socket.on('pages/cursors/create:failure', function(error) {
//		  console.log(error);
//		  });
//  socket.emit('pages/cursors/create', {
//            "uId": "101010101010101010101010",
//			frames: [
//			{ pos: { x: 10, y: 10}, t: 0 },
//			{ pos: { x: 20, y: 20}, t: 30 }
//			]
//        });
