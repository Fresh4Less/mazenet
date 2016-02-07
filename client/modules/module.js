define(["require", "exports", './MazenetDirective', './Canvas/module', './Elements/module', './BuildMenu/module', './ng-context-menu'], function (require, exports, MazenetDirective, CanvasModule, ElementsModule, BuildMenuModule, ngContextMenu) {
    return angular.module('modules', [
        CanvasModule.name,
        ElementsModule.name,
        BuildMenuModule.name,
        ngContextMenu.name
    ]).directive("mzMazenet", MazenetDirective);
});
//# sourceMappingURL=module.js.map