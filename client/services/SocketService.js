define(["require", "exports", 'socketio'], function (require, exports, io) {
    var SocketService = (function () {
        function SocketService($q, $http, $location, UserService, ActivePageService) {
            this.$q = $q;
            this.$http = $http;
            this.$location = $location;
            this.UserService = UserService;
            this.ActivePageService = ActivePageService;
            this.pageEnterPromise = null;
            this.elementCreatePromise = null;
        }
        SocketService.prototype.Init = function () {
            if (!this.socket || !this.socket.connected) {
                this.socket = io('http://' + this.$location.host() + ':' + this.$location.port() + '/mazenet');
                this.socket.on('users/connected', this.connectedCallback());
                this.socket.on('users/connected:failure', this.connectErrorCallback());
                this.socket.on('pages/userEntered', this.userEnteredCallback());
                this.socket.on('pages/userLeft', this.userLeftCallback());
                this.socket.on('pages/cursors/moved', this.userMovedCursorCallback());
                this.socket.on('pages/enter:success', this.userEnterPageCallback());
                this.socket.on('pages/enter:failure', this.userEnterPageFailureCallback());
                this.socket.on('pages/elements/created', this.elementCreatedCallback());
                this.socket.on('pages/element/create:failure', this.elementCreateFailureCallback());
                this.socket.on('pages/updated', this.pageUpdatedCallback());
                this.socket.on('pages/update:failure', this.pageUpdateFailureCallback());
            }
        };
        SocketService.prototype.EnterPage = function (pageId, pos) {
            this.pageEnterPromise = this.$q.defer();
            var startPage = {
                pId: pageId,
                pos: {
                    x: pos.x,
                    y: pos.y
                }
            };
            this.socket.emit('pages/enter', startPage);
            return this.pageEnterPromise.promise;
        };
        SocketService.prototype.UpdatePage = function (pageData) {
            this.socket.emit('pages/update', pageData);
        };
        SocketService.prototype.CreateElement = function (element) {
            this.elementCreatePromise = this.$q.defer();
            this.socket.emit('pages/elements/create', element);
            return this.elementCreatePromise.promise;
        };
        SocketService.prototype.CursorMove = function (cursor) {
            this.socket.emit('pages/cursors/moved', cursor);
        };
        /* Event Handlers */
        SocketService.prototype.connectedCallback = function () {
            var self = this;
            return function (user) {
                self.UserService.UserData.uId = user.uId;
                self.ActivePageService.RootPages.root = user.rootPageId;
                self.ActivePageService.RootPages.homepage = user.homepageId;
                self.loadInitialPage();
            };
        };
        ;
        SocketService.prototype.connectErrorCallback = function () {
            return function (error) {
                console.error("Could not connect to the Mazenet.", error);
            };
        };
        ;
        SocketService.prototype.userEnteredCallback = function () {
            var self = this;
            return function (user) {
                console.log(user);
                self.UserService.AddUser(user);
            };
        };
        ;
        SocketService.prototype.userLeftCallback = function () {
            var self = this;
            return function (user) {
                self.UserService.RemoveUser(user);
            };
        };
        ;
        SocketService.prototype.userMovedCursorCallback = function () {
            var self = this;
            return function (cursor) {
                self.UserService.UpdatePosition(cursor);
            };
        };
        ;
        SocketService.prototype.userEnterPageCallback = function () {
            var self = this;
            return function (pageData) {
                self.$location.path('room/' + pageData.page._id);
                self.ActivePageService.LoadPage(pageData.page);
                self.UserService.SetUsers(pageData.users);
                self.pageEnterPromise.resolve(pageData);
            };
        };
        ;
        SocketService.prototype.userEnterPageFailureCallback = function () {
            var self = this;
            return function (error) {
                self.pageEnterPromise.reject(error);
            };
        };
        ;
        SocketService.prototype.elementCreatedCallback = function () {
            var self = this;
            return function (element) {
                self.ActivePageService.AddElement(element);
                self.elementCreatePromise.resolve(element);
            };
        };
        ;
        SocketService.prototype.elementCreateFailureCallback = function () {
            var self = this;
            return function (error) {
                self.elementCreatePromise.reject(error);
            };
        };
        ;
        SocketService.prototype.pageUpdatedCallback = function () {
            var _this = this;
            var self = this;
            return function (pageChanges) {
                _this.ActivePageService.UpdatePage(pageChanges);
            };
        };
        ;
        SocketService.prototype.pageUpdateFailureCallback = function () {
            var self = this;
            return function (error) {
                console.error('Error updating page.', error);
            };
        };
        ;
        SocketService.prototype.loadInitialPage = function () {
            var self = this;
            var successCallback = function (page) {
                console.log('Welcome to Mazenet.', self.UserService.UserData);
            };
            var failureCallback = function (error) {
                console.error('Could not enter page... redirecting to root.');
                self.EnterPage(error.rootPageId, { x: 0, y: 0 }).then(successCallback, function (error) {
                    console.error('Error loading root page. The Mazenet is dead.');
                });
            };
            if (self.ActivePageService.RootPages.url) {
                self.EnterPage(self.ActivePageService.RootPages.url, { x: 0, y: 0 }).then(successCallback, failureCallback);
            }
            else if (self.ActivePageService.RootPages.homepage) {
                self.EnterPage(self.ActivePageService.RootPages.homepage, { x: 0, y: 0 }).then(successCallback, failureCallback);
            }
            else if (self.ActivePageService.RootPages.root) {
                self.EnterPage(self.ActivePageService.RootPages.root, { x: 0, y: 0 }).then(successCallback, failureCallback);
            }
            else {
                console.error('No root page, homepage, or url page defined.');
            }
        };
        SocketService.name = "SocketService";
        SocketService.FactoryDefinition = [
            '$q',
            '$http',
            '$location',
            'UserService',
            'ActivePageService',
            function ($q, $http, $location, UserService, ActivePageService) { return new SocketService($q, $http, $location, UserService, ActivePageService); }
        ];
        return SocketService;
    })();
    return SocketService;
});
//# sourceMappingURL=SocketService.js.map