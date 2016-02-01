/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../typings/tsd.d.ts" />
define(["require", "exports"], function (require, exports) {
    var BuildMenuController = (function () {
        function BuildMenuController($scope, SocketService, ActivePageService, ContextMenuService, UserService, CursorService) {
            this.$scope = $scope;
            this.SocketService = SocketService;
            this.ActivePageService = ActivePageService;
            this.ContextMenuService = ContextMenuService;
            this.UserService = UserService;
            this.CursorService = CursorService;
            this.resetLocalData = function () {
                this.newLink = {
                    eType: "link",
                    creator: "unset",
                    pos: {
                        x: this.ContextMenuService.position.x,
                        y: this.ContextMenuService.position.y
                    },
                    data: {
                        text: ""
                    }
                };
                this.pageSettings = {
                    title: this.ActivePageService.PageData.title,
                    permissions: this.ActivePageService.PageData.permissions,
                    background: {
                        bType: this.ActivePageService.PageData.background.bType,
                        data: {
                            color: this.ActivePageService.PageData.background.data.color
                        }
                    }
                };
            };
            this.isOpen = false;
            this.cursorService = CursorService;
            this.tunnelingInfo = {
                isTunneling: false,
                text: 'NEW_LINK',
                pos: {
                    x: -1,
                    y: -1
                }
            };
            this.newLink = {
                eType: "link",
                creator: "unset",
                pos: {
                    x: 0,
                    y: 0
                },
                data: {
                    text: ""
                }
            };
            this.pageSettings = null;
            this.state = 'root';
            var self = this;
            ContextMenuService.openCallback = function () {
                self.resetLocalData();
                self.isOpen = true;
            };
            ContextMenuService.closeCallback = function () {
                self.state = 'root';
                self.isOpen = false;
            };
            ActivePageService.OnAddElement(function (element) {
                if (self.tunnelingInfo.pos.x == element.pos.x && self.tunnelingInfo.pos.y == element.pos.y) {
                    self.tunnelingInfo.isTunneling = false;
                    self.tunnelingInfo.pos.x = -1;
                    self.tunnelingInfo.pos.y = -1;
                }
            });
        }
        BuildMenuController.prototype.backToRoot = function () {
            this.state = "root";
        };
        ;
        BuildMenuController.prototype.newRoomSelected = function () {
            this.state = "newRoom";
        };
        ;
        BuildMenuController.prototype.pageSettingsSelected = function () {
            this.state = "pageSettings";
        };
        ;
        BuildMenuController.prototype.newImageSelected = function () {
            this.state = "root";
        };
        ;
        BuildMenuController.prototype.createPage = function () {
            this.newLink.pos.x = this.ContextMenuService.position.x;
            this.newLink.pos.y = this.ContextMenuService.position.y;
            this.newLink.creator = this.UserService.UserData.uId;
            this.closeContextMenu();
            this.tunnelingInfo.isTunneling = true;
            this.tunnelingInfo.pos.x = this.ContextMenuService.position.x;
            this.tunnelingInfo.pos.y = this.ContextMenuService.position.y;
            this.tunnelingInfo.text = this.newLink.data.text;
            this.SocketService.CreateElement(this.newLink);
        };
        ;
        BuildMenuController.prototype.updatePage = function () {
            this.SocketService.UpdatePage(this.pageSettings);
        };
        ;
        BuildMenuController.prototype.closeContextMenu = function () {
            this.ContextMenuService.forceClose = true;
        };
        ;
        BuildMenuController.$inject = [
            '$scope',
            'SocketService',
            'ActivePageService',
            'ContextMenuService',
            'UserService',
            'CursorService'
        ];
        return BuildMenuController;
    })();
    return BuildMenuController;
});
//# sourceMappingURL=BuildMenuController.js.map