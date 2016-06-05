define(["require", "exports", './CanvasController'], function (require, exports, CanvasController) {
    function CanvasDirective() {
        var directive = {
            restrict: 'E',
            templateUrl: '/modules/Canvas/CanvasTemplate.html',
            controller: CanvasController,
            controllerAs: 'cvCtrl',
            bindToController: true,
        };
        return directive;
    }
    return CanvasDirective;
});
//# sourceMappingURL=CanvasDirective.js.map