define(["require", "exports", './Cursors/module', './Pages/module', './SocketService', './UserService'], function (require, exports, CursorService, PagesService, SocketService, UserService) {
    return angular.module('services', [
        CursorService.name,
        PagesService.name
    ])
        .factory(SocketService.name, SocketService.FactoryDefinition)
        .factory(UserService.name, UserService.FactoryDefinition);
});
//# sourceMappingURL=module.js.map