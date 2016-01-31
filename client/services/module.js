define(["require", "exports", './Cursors/module', './SocketService', './UserService'], function (require, exports, CursorService, SocketService, UserService) {
    return angular.module('services', [
        CursorService.name])
        .factory(SocketService.name, SocketService)
        .factory(UserService.name, UserService);
});
//# sourceMappingURL=module.js.map