/* global io */
var socketService = function ($q, $http, $location, UserService, ActivePageService) {
	var socket = null;
	var pageEnterPromise = null;
	var elementCreatePromise = null;
	/* Event Handlers */
	var connected = function(user) {
		console.log('Connected', user);
		UserService.UserData.uId = user.uId;
		ActivePageService.RootPages.root = user.rootPageId;
		ActivePageService.RootPages.homepage = user.homepageId;
		loadInitialPage();
	}
	var userEntered = function(user) {
		UserService.AddUser(user);
	}
	var userLeft = function(user) {
		UserService.RemoveUser(user);
	}
	var userMovedCursor = function(cursor) {
		UserService.UpdatePosition(cursor);
	}
	var userEnterPage = function(pageData) {
		ActivePageService.UpdatePage(pageData.page);
		UserService.SetUsers(pageData.users);
		pageEnterPromise.resolve(pageData);
	}
	var userEnterPageFailure = function(error) {
		pageEnterPromise.reject(error);
	}
	var elementCreated = function(element) {
		ActivePageService.AddElement(element);
		elementCreatePromise.resolve(element);
	}
	var elementCreateFailure = function(error) {
		elementCreatePromise.reject(error);	
	}
	
	/* External Functions */
	function init() {
		if(!socket || !socket.connected) {
			socket = io('http://'+ $location.host() +':' + $location.port() + '/mazenet');
			socket.on('users/connected', connected);
			socket.on('pages/userEntered', userEntered);
			socket.on('pages/userLeft', userLeft);
			socket.on('pages/cursors/moved', userMovedCursor);
			socket.on('pages/enter:success', userEnterPage);
			socket.on('pages/enter:failure', userEnterPageFailure);
			socket.on('pages/elements/created', elementCreated);
			socket.on('pages/element/create:failure', elementCreateFailure);
		}
	}
	
	function enterPage(pageId, pos) {
		pageEnterPromise = $q.defer();
		var startPage = {
			pId: pageId,	
			pos: {
				x: pos.x,
				y: pos.y
			}
		};
		socket.emit('pages/enter', startPage);
		return pageEnterPromise.promise;	
	}
	
	function createElement(element) {
		elementCreatePromise = $q.defer();
		
		socket.emit('pages/elements/create', element);
		
		return elementCreatePromise.promise;
	}
	
	function cursorMove(cursor) {
		socket.emit('pages/cursors/moved', cursor);
	}
	
	function loadInitialPage() {
		var successCallback = function(page) {
			ActivePageService.UpdatePage(page.page);
		}
		var failureCallback = function(error) {
			console.error('Could not enter page defaulting to root.');
			enterPage(error.rootPageId).then(successCallback, function(error) {
				console.error('Error loading root page. The Mazenet is dead');
			})
		}
		if(ActivePageService.RootPages.url) {
			enterPage(ActivePageService.RootPages.url, {x: 0, y: 0}).then(successCallback, failureCallback);
		} else if(ActivePageService.RootPages.homepage) {
			enterPage(ActivePageService.RootPages.homepage, {x: 0, y: 0}).then(successCallback, failureCallback);
		} else if(ActivePageService.RootPages.root) {
			enterPage(ActivePageService.RootPages.root, {x: 0, y: 0}).then(successCallback, failureCallback);
		} else {
			console.error('No root page, homepage, or url page defined.');
		}
	}
	
	return {
		Init : init,
		EnterPage : enterPage,
		CreateElement : createElement,
		CursorMove: cursorMove
	}
};

angular.module('mazenet').factory ('SocketService', ['$q', '$http','$location', 'UserService', 'ActivePageService', socketService]);
