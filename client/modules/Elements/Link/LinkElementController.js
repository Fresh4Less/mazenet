/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../../typings/tsd.d.ts" />
define(["require", "exports"], function (require, exports) {
    var LinkElementController = (function () {
        function LinkElementController(ActivePageService, SocketService) {
            this.ActivePageService = ActivePageService;
            this.SocketService = SocketService;
            this.EnterPage = function ($event, pId) {
                var id = pId;
                if (!pId) {
                    id = this.ActivePageService.RootPages.root;
                }
                var pos = {
                    x: $event.clientX,
                    y: $event.clientY
                };
                this.SocketService.EnterPage(id, pos).then(function (data) {
                    //Success :)
                }, function (error) {
                    console.error('Error entering page:', id, error);
                    alert("Unable To Enter Page.\n" + error.message);
                });
            };
        }
        LinkElementController.$inject = [
            'ActivePageService',
            'SocketService'
        ];
        return LinkElementController;
    })();
    return LinkElementController;
});
//# sourceMappingURL=LinkElementController.js.map