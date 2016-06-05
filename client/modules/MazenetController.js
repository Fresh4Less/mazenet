/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../typings/tsd.d.ts" />
define(["require", "exports"], function (require, exports) {
    var MazenetController = (function () {
        function MazenetController($scope, $window, CursorService, ActivePageService, UserService) {
            this.$scope = $scope;
            this.$window = $window;
            this.CursorService = CursorService;
            this.ActivePageService = ActivePageService;
            this.UserService = UserService;
            this.Page = ActivePageService.PageData;
            this.OtherUsers = UserService.OtherUsers;
            UserService.RedrawCallback = function () { $scope.$apply(); };
        }
        MazenetController.prototype.CursorMove = function ($event) {
            this.CursorService.UserMovedCursor($event);
        };
        MazenetController.$inject = [
            '$scope',
            '$window',
            'CursorService',
            'ActivePageService',
            'UserService'
        ];
        return MazenetController;
    })();
    return MazenetController;
});
//# sourceMappingURL=MazenetController.js.map