define(["require", "exports", './MazenetDirective', './Canvas/module', './Elements/module', './BuildMenu/module'], function (require, exports, MazenetDirective, CanvasModule, ElementsModule, BuildMenuModule) {
    return angular.module('modules', [
        CanvasModule.name,
        ElementsModule.name,
        BuildMenuModule.name
    ]).directive("mzMazenet", MazenetDirective);
});
//# sourceMappingURL=module.js.map