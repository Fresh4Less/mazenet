define(["require", "exports"], function (require, exports) {
    var SocketService = (function () {
        function SocketService($q, $http, $location, UserService, ActivePageService) {
            this.$q = $q;
            this.$http = $http;
            this.$location = $location;
            this.UserService = UserService;
            this.ActivePageService = ActivePageService;
            this.pageEnterPromise = null;
            this.elementCreatePromise = null;
            /* Event Handlers */
            this.connected = function (user) {
                this.UserService.UserData.uId = user.uId;
                this.ActivePageService.RootPages.root = user.rootPageId;
                this.ActivePageService.RootPages.homepage = user.homepageId;
                this.loadInitialPage();
            };
            this.connectError = function (error) {
                console.error("Could not connect to the Mazenet.", error);
            };
            this.userEntered = function (user) {
                this.UserService.AddUser(user);
            };
            this.userLeft = function (user) {
                this.UserService.RemoveUser(user);
            };
            this.userMovedCursor = function (cursor) {
                this.UserService.UpdatePosition(cursor);
            };
            this.userEnterPage = function (PageData) {
                this.$location.path('room/' + PageData.page._id);
                this.ActivePageService.UpdatePage(PageData.page);
                this.UserService.SetUsers(PageData.users);
                this.pageEnterPromise.resolve(PageData);
            };
            this.userEnterPageFailure = function (error) {
                this.pageEnterPromise.reject(error);
            };
            this.elementCreated = function (element) {
                this.ActivePageService.AddElement(element);
                this.elementCreatePromise.resolve(element);
            };
            this.elementCreateFailure = function (error) {
                this.elementCreatePromise.reject(error);
            };
            this.pageUpdated = function (pageChanges) {
                this.ActivePageService.UpdatePage(pageChanges);
            };
            this.pageUpdateFailure = function (error) {
                console.error('Error updating page.', error);
            };
        }
        SocketService.prototype.Init = function () {
            if (!this.socket || !this.socket.connected) {
                this.socket = io('http://' + this.$location.host() + ':' + this.$location.port() + '/mazenet');
                this.socket.on('users/connected', this.connected);
                this.socket.on('users/connected:failure', this.connectError);
                this.socket.on('pages/userEntered', this.userEntered);
                this.socket.on('pages/userLeft', this.userLeft);
                this.socket.on('pages/cursors/moved', this.userMovedCursor);
                this.socket.on('pages/enter:success', this.userEnterPage);
                this.socket.on('pages/enter:failure', this.userEnterPageFailure);
                this.socket.on('pages/elements/created', this.elementCreated);
                this.socket.on('pages/element/create:failure', this.elementCreateFailure);
                this.socket.on('pages/updated', this.pageUpdated);
                this.socket.on('pages/update:failure', this.pageUpdateFailure);
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
        SocketService.name = "SocketService";
        SocketService.$inject = [
            '$q',
            '$http',
            '$location',
            'UserService',
            'ActivePageService'
        ];
        return SocketService;
    })();
    return SocketService;
});
//# sourceMappingURL=SocketService.js.map