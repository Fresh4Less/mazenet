var expect = require('chai').expect;
var sinon = require('sinon');

var BPromise = require('bluebird');

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

	it('should notify all clients in the room when users enter and leave', function() {
		//enter 1 -> enter 2 -> enter 3 -> leave 3 -> leave 2
		var socket1 = null;
		var socket1Uid = null;
		var socket1EnterPos = {x: 60, y: 60};

		var socket2 = null;
		var socket2Uid = null;
		var socket2EnterPos = {x: 50, y: 50};

		var socket3 = null;
		var socket3Uid = null;
		var socket3EnterPos = {x: 40, y: 40};

		return BPromise.try(function() {
			// connect 1
			socket1 = socketClient(connectUrl, socketOptions);
		}).then(function() {
			// 1 connected, enter 1
			return new BPromise(function(resolve, reject) {
				socket1.on('users/connected', function(userData) {
					socket1Uid = userData.uId;
					socket1.emit('pages/enter', { pId: userData.rootPageId, pos: socket1EnterPos});
					resolve();
				});
			});
		}).then(function() {
			// 1 entered
			return new BPromise(function(resolve, reject) {
				socket1.on('pages/enter:success', function(page) {
					expect(page.users).to.have.length(0);
					resolve();
				});
			});
		}).then(function() {
			// connect 2
			socket2 = socketClient(connectUrl, socketOptions);
		}).then(function() {
			// 2 connected, enter 2
			return new BPromise(function(resolve, reject) {
				socket2.on('users/connected', function(userData) {
					socket2Uid = userData.uId;
					socket2.emit('pages/enter', { pId: userData.rootPageId, pos: socket2EnterPos});
					resolve();
				});
			});
		}).then(function() {
			// 2 entered
			return BPromise.all([
				new BPromise(function(resolve, reject) {
					socket2.on('pages/enter:success', function(page) {
						expect(page.users).to.have.length(1);
						expect(page.users).to.contain({ uId: socket1Uid, pos: socket1EnterPos });
						resolve();
					});
				}),
				new BPromise(function(resolve, reject) {
					socket1.on('pages/userEntered', function(userData) {
						expect(userData).deep.equals({ uId: socket2Uid, pos: socket2EnterPos });
						socket1.removeAllListeners('pages/userEntered');
						resolve();
					});
				})]);
		}).then(function() {
			// connect 3
			socket3 = socketClient(connectUrl, socketOptions);
		}).then(function() {
			// 3 connected, enter 3
			return new BPromise(function(resolve, reject) {
				socket3.on('users/connected', function(userData) {
					socket3Uid = userData.uId;
					socket3.emit('pages/enter', { pId: userData.rootPageId, pos: socket3EnterPos});
					resolve();
				});
			});
		}).then(function() {
			// 3 entered
				return BPromise.all([
					new BPromise(function(resolve, reject) {
						socket1.on('pages/userEntered', function(userData) {
							expect(userData).deep.equals({ uId: socket3Uid, pos: socket3EnterPos});
							resolve();
						});
					}),
					new BPromise(function(resolve, reject) {
						socket2.on('pages/userEntered', function(userData) {
							expect(userData).deep.equals({ uId: socket3Uid, pos: socket3EnterPos});
							resolve();
						});
					}),
					new BPromise(function(resolve, reject) {
						socket3.on('pages/enter:success', function(page) {
							expect(page.users).to.have.length(2);
							expect(page.users).to.contain({ uId: socket1Uid, pos: socket1EnterPos });
							expect(page.users).to.contain({ uId: socket2Uid, pos: socket2EnterPos });
							resolve();
						});
					})]);
		}).then(function() {
			// disconnect 3
			socket3.disconnect();
		}).then(function() {
			// 3 left
			return BPromise.all([
				new BPromise(function(resolve, reject) {
					socket1.on('pages/userLeft', function(userData) {
						expect(userData).deep.equals({ uId: socket3Uid });
						socket1.removeAllListeners('pages/userLeft');
						resolve();
					});
				}),
				new BPromise(function(resolve, reject) {
					socket2.on('pages/userLeft', function(userData) {
						expect(userData).deep.equals({ uId: socket3Uid });
						resolve();
					});
				})]);
		}).then(function() {
			// disconnect 2
			socket2.disconnect();
		}).then(function() {
			return new Promise(function(resolve, reject) {
				socket1.on('pages/userLeft', function(userData) {
					expect(userData).deep.equals({ uId: socket2Uid });
					resolve();
				});
			});
		});
	});
	it('should update live cursor positions', function() {
		//enter 1 -> move 1 -> enter 2 -> move 1 -> move 2
		var socket1 = null;
		var socket1Uid = null;
		var socket1EnterPos = {x: 60, y: 60};
		var socket1Move1 = { pos: {x: 80, y: 80}, t: 10 };
		var socket1Move2 = { pos: {x: 90, y: 90}, t: 20 };

		var socket2 = null;
		var socket2Uid = null;
		var socket2EnterPos = {x: 50, y: 50};
		var socket2Move1 = { pos: {x: 30, y: 30}, t: 10};

		return BPromise.try(function() {
			// connect 1
			socket1 = socketClient(connectUrl, socketOptions);
		}).then(function() {
			// 1 connected, enter 1
			return new BPromise(function(resolve, reject) {
				socket1.on('users/connected', function(userData) {
					socket1Uid = userData.uId;
					socket1.emit('pages/enter', { pId: userData.rootPageId, pos: socket1EnterPos});
					resolve();
				});
			});
		}).then(function() {
			// 1 entered
			return new BPromise(function(resolve, reject) {
				socket1.on('pages/enter:success', function(page) {
					expect(page.users).to.have.length(0);
					resolve();
				});
			});
		}).then(function() {
			// move 1-1
			socket1.emit('pages/cursors/moved', socket1Move1);
		}).then(function() {
			// connect 2
			socket2 = socketClient(connectUrl, socketOptions);
		}).then(function() {
			// 2 connected, enter 2
			return new BPromise(function(resolve, reject) {
				socket2.on('users/connected', function(userData) {
					socket2Uid = userData.uId;
					socket2.emit('pages/enter', { pId: userData.rootPageId, pos: socket2EnterPos});
					resolve();
				});
			});
		}).then(function() {
			// 2 entered
			return BPromise.all([
				new BPromise(function(resolve, reject) {
					socket2.on('pages/enter:success', function(page) {
						expect(page.users).to.have.length(1);
						expect(page.users).to.contain({ uId: socket1Uid, pos: socket1Move1.pos });
						resolve();
					});
				}),
				new BPromise(function(resolve, reject) {
					socket1.on('pages/userEntered', function(userData) {
						expect(userData).deep.equals({ uId: socket2Uid, pos: socket2EnterPos });
						socket1.removeAllListeners('pages/userEntered');
						resolve();
					});
				})]);
		}).then(function() {
			// move 1-2
			socket1.emit('pages/cursors/moved', socket1Move2);
		}).then(function() {
			// 1 moved 2
			return new BPromise(function(resolve, reject) {
				socket2.on('pages/cursors/moved', function(cursor) {
					expect(cursor).deep.equals({ uId: socket1Uid, pos: socket1Move2.pos });
					socket2.removeAllListeners('pages/cursors/moved');
					resolve();
				});
			});
		}).then(function() {
			// move 2-1
			socket2.emit('pages/cursors/moved', socket2Move1);
		}).then(function() {
			// 2 moved 1
			return new BPromise(function(resolve, reject) {
				socket1.on('pages/cursors/moved', function(cursor) {
					expect(cursor).deep.equals({ uId: socket2Uid, pos: socket2Move1.pos });
					socket1.removeAllListeners('pages/cursors/moved');
					resolve();
				});
			});
		});
	});
	it('should commit cursor positions to the page on room exit', function() {
		//enter 1 -> move 1 -> move 1 -> move 1 -> disconnect 1 -> enter 2
		var socket1 = null;
		var socket1Uid = null;
		var socket1EnterPos = {x: 60, y: 60};
		var socket1Move1 = { pos: {x: 80, y: 80}, t: 10 };
		var socket1Move2 = { pos: {x: 90, y: 90}, t: 20 };
		var socket1Move3 = { pos: {x: 30, y: 30}, t: 25};

		var socket2 = null;
		var socket2Uid = null;
		var socket2EnterPos = {x: 50, y: 50};

		return BPromise.try(function() {
			// connect 1
			socket1 = socketClient(connectUrl, socketOptions);
		}).then(function() {
			// 1 connected, enter 1
			return new BPromise(function(resolve, reject) {
				socket1.on('users/connected', function(userData) {
					socket1Uid = userData.uId;
					socket1.emit('pages/enter', { pId: userData.rootPageId, pos: socket1EnterPos});
					resolve();
				});
			});
		}).then(function() {
			// 1 entered
			return new BPromise(function(resolve, reject) {
				socket1.on('pages/enter:success', function(page) {
					resolve();
				});
			});
		}).then(function() {
			// move 1-1
			socket1.emit('pages/cursors/moved', socket1Move1);
			// move 1-2
			socket1.emit('pages/cursors/moved', socket1Move2);
			// move 1-3
			socket1.emit('pages/cursors/moved', socket1Move3);
		}).then(function() {
			// disconnect 1
			// 1 disconnected
			return new BPromise(function(resolve, reject) {
				// wait for the server to process
				// (externally we have no guarantees of time until a cursor is committed)
				var waitTime = 10;
				socket1.on('disconnect', function() {
					setTimeout(function() {
					resolve();
					}, waitTime);
				});
				socket1.disconnect();
			});
		}).then(function() {
			// connect 2
			socket2 = socketClient(connectUrl, socketOptions);
		}).then(function() {
			// 2 connected, enter 2
			return new BPromise(function(resolve, reject) {
				socket2.on('users/connected', function(userData) {
					socket2Uid = userData.uId;
					socket2.emit('pages/enter', { pId: userData.rootPageId, pos: socket2EnterPos});
					resolve();
				});
			});
		}).then(function() {
			// 2 entered
			return new BPromise(function(resolve, reject) {
				socket2.on('pages/enter:success', function(page) {
					expect(page.users).to.have.length(0);
					expect(page.page.cursors).to.have.length(1);
					expect(page.page.cursors[0].uId).equals(socket1Uid);
					expect(page.page.cursors[0].frames).to.have.length(4);
					expect(page.page.cursors[0].frames[0]).to.deep.equal({ pos: socket1EnterPos, t: 0});
					expect(page.page.cursors[0].frames[1]).to.deep.equal(socket1Move1);
					expect(page.page.cursors[0].frames[2]).to.deep.equal(socket1Move2);
					expect(page.page.cursors[0].frames[3]).to.deep.equal(socket1Move3);
					resolve();
				});
			});
		});
	});
	it('should correctly create a new link element and corresponding page', function() {
		//enter 1 -> create link 1 -> enter new link 1 -> disconnect 1 -> enter 2 -> enter new link 2
		var socket1 = null;
		var socket1Uid = null;
		var socket1EnterPos = {x: 60, y: 60};
		var newLink1 = {
			eType: 'link',
			pos: {
				x: 15,
				y: 16
			},
			data: {
				text: 'my new page!'
			}
		};

		var socket2 = null;
		var socket2Uid = null;
		var socket2EnterPos = {x: 50, y: 50};

		var socket3 = null;
		var socket3Uid = null;
		var socket3EnterPos = {x: 50, y: 50};

		var rootPage = null;
		var expectedNewPage = null;

		return BPromise.try(function() {
			// connect 1
			socket1 = socketClient(connectUrl, socketOptions);
		}).then(function() {
			// 1 connected, enter 1
			return new BPromise(function(resolve, reject) {
				socket1.on('users/connected', function(userData) {
					socket1Uid = userData.uId;
					socket1.emit('pages/enter', { pId: userData.rootPageId, pos: socket1EnterPos});
					resolve();
				});
			});
		}).then(function() {
			// 1 entered
			return new BPromise(function(resolve, reject) {
				socket1.on('pages/enter:success', function(page) {
					rootPage = page.page;
					socket1.removeAllListeners('pages/enter:success');
					resolve();
				});
			});
		}).then(function() {
			// connect 2
			socket2 = socketClient(connectUrl, socketOptions);
		}).then(function() {
			// 2 connected, enter 2
			return new BPromise(function(resolve, reject) {
				socket2.on('users/connected', function(userData) {
					socket2Uid = userData.uId;
					socket2.emit('pages/enter', { pId: userData.rootPageId, pos: socket2EnterPos});
					resolve();
				});
			});
		}).then(function() {
			// 2 entered
			return new BPromise(function(resolve, reject) {
				socket2.on('pages/enter:success', function(page) {
					socket2.removeAllListeners('pages/enter:success');
					resolve();
				});
			});
		}).then(function() {
			// new link 1-1
			newLink1.creator = socket1Uid;
			socket1.emit('pages/elements/create', newLink1);
		}).then(function() {
			// 1 link created
			return BPromise.all([
				new BPromise(function(resolve, reject) {
					socket1.on('pages/elements/created', function(element) {
						newLink1._id = element._id;
						newLink1.data.pId = element.data.pId;
						expect(element).to.deep.equal(newLink1);
						resolve();
					});
				}),
				new BPromise(function(resolve, reject) {
					socket2.on('pages/elements/created', function(element) {
						newLink1._id = element._id;
						newLink1.data.pId = element.data.pId;
						expect(element).to.deep.equal(newLink1);
						resolve();
					});
			})]);
		}).then(function() {
			// enter 1, enter 2
			socket1.emit('pages/enter', { pId: newLink1.data.pId, pos: socket1EnterPos});
			socket2.emit('pages/enter', { pId: newLink1.data.pId, pos: socket2EnterPos});
		}).then(function() {
			// 1 entered, 2 entered
			expectedNewPage = {
				_id: newLink1.data.pId,
				creator: socket1Uid,
				permissions: 'all',
				title: newLink1.data.text,
				background: {
					bType: 'color',
					data: {
						color: '#ffffff'
					}
				},
				owners: [socket1Uid],
				elements: [{
						classes: [
							'backLink'
						],
						eType: 'link',
						creator: socket1Uid,
						pos: newLink1.pos,
						data: {
							text: rootPage.title,
							pId: rootPage._id
						}
					}
				]
			};

			return BPromise.all([
				new BPromise(function(resolve, reject) {
					socket1.on('pages/enter:success', function(page) {
						expectedNewPage.elements[0]._id = page.page.elements[0]._id;
						expect(page.page).deep.equals(expectedNewPage);
						resolve();
					});
				}),
				new BPromise(function(resolve, reject) {
					socket2.on('pages/enter:success', function(page) {
						expectedNewPage.elements[0]._id = page.page.elements[0]._id;
						expect(page.page).deep.equals(expectedNewPage);
						resolve();
					});
				})]);
		}).then(function() {
			// disconnect 1, disconnect 2
			// 1 disconnected, 2 disconnected
			var waitTime = 10;
			return BPromise.all([
				new BPromise(function(resolve, reject) {
				// wait for the server to process
				// (externally we have no guarantees of time until a cursor is committed)
				socket1.on('disconnect', function() {
					setTimeout(function() {
					resolve();
					}, waitTime);
				});
				socket1.disconnect();
			}),
				new BPromise(function(resolve, reject) {
				// wait for the server to process
				// (externally we have no guarantees of time until a cursor is committed)
				socket2.on('disconnect', function() {
					setTimeout(function() {
					resolve();
					}, waitTime);
				});
				socket2.disconnect();
			})]);
		}).then(function() {
			// connect 3
			socket3 = socketClient(connectUrl, socketOptions);
		}).then(function() {
			// 3 connected, enter 3
			return new BPromise(function(resolve, reject) {
				socket3.on('users/connected', function(userData) {
					socket3Uid = userData.uId;
					socket3.emit('pages/enter', { pId: userData.rootPageId, pos: socket3EnterPos});
					resolve();
				});
			});
		}).then(function() {
			// 3 entered
			return new BPromise(function(resolve, reject) {
				socket3.on('pages/enter:success', function(page) {
					expect(page.users).to.have.length(0);
					expect(page.page.cursors).to.have.length(2);
					expect(page.page.cursors).to.contain({uId: socket1Uid,
						frames: [{ pos: socket1EnterPos, t: 0}]});
					expect(page.page.cursors).to.contain({uId: socket2Uid,
						frames: [{ pos: socket2EnterPos, t: 0}]});
					expect(page.page.elements).to.have.length(2);
					expect(page.page.elements).to.contain(newLink1);
					socket3.removeAllListeners('pages/enter:success');
					resolve();
				});
			});
		}).then(function() {
			// enter 1, enter 2
			socket3.emit('pages/enter', { pId: newLink1.data.pId, pos: socket3EnterPos});
		}).then(function() {
			return new BPromise(function(resolve, reject) {
				socket3.on('pages/enter:success', function(page) {
					expect(page.page.cursors).to.have.length(2);
					expect(page.page.cursors).to.contain({ uId: socket1Uid, frames: [{ pos: socket1EnterPos, t: 0 }]});
					expect(page.page.cursors).to.contain({ uId: socket2Uid, frames: [{ pos: socket2EnterPos, t: 0 }]});
					delete page.page.cursors;
					expect(page.page).deep.equals(expectedNewPage);
					resolve();
				});
			});
		});
	});
});
//TODO: test errors
//TODO: test page updates
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
//socket.on('pages/enter:failure', function(error) {
		//console.log('enter page failed');
		//console.log(error);
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
