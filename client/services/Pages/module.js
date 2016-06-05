define(["require", "exports", './ActivePageService'], function (require, exports, ActivePageService) {
    return angular.module('pages', [])
        .factory(ActivePageService.name, ActivePageService.FactoryDefinition);
});
//# sourceMappingURL=module.js.map