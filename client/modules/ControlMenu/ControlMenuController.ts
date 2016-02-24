/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../typings/tsd.d.ts" />

import $ = require('jquery');
import ISocketService = require("../../services/Interfaces/ISocketService");
import IActivePageService = require("../../services/Pages/Interfaces/IActivePageService");
import IUserService = require("../../services/Interfaces/IUserService");
import ICursorService = require("../../services/Cursors/Interfaces/ICursorService");
import IElement = require("../../models/Interfaces/IElement");
import Page = require("../../models/Pages/Page");
import IMenuService = require("../../services/Interfaces/IMenuService");
import IClickNetService = require("../../services/Interfaces/IClickNetService");

export = ControlMenuController;

class ControlMenuController {

    public page:Page;
    private controlMenu:HTMLElement;
    private controlPanel:HTMLElement;

    static $inject = [
        '$scope',
        '$timeout',
        '$mdSidenav',
        'ActivePageService',
        'UserService',
        'CursorService',
        'MenuService',
        'ClickNetService'
    ];

    constructor(private $scope:ng.IScope,
                private $timeout:ng.ITimeoutService,
                private $mdSidenav:ng.material.ISidenavService,
                private ActivePageService:IActivePageService,
                private UserService:IUserService,
                private CursorService:ICursorService,
                public MenuService:IMenuService,
                public ClickNetService:IClickNetService) {
        this.page = ActivePageService.PageData;
        this.ToggleLeft = this.buildToggler('left');
        this.ToggleRight = this.buildToggler('right');
    }

    public ToggleLeft:()=>void;
    public ToggleRight:()=>void;

    public IsOpenRight() {
        return this.$mdSidenav('right').isOpen();
    }
    public IsOpenLeft() {
        return this.$mdSidenav('left').isOpen();
    }

    public RoomNameClick() {
        this.ToggleLeft();
        this.MenuService.OpenRoomMenu();
    }

    public TunnelRoomClick() {
        this.ToggleRight();
        this.MenuService.OpenTunnelMenu();
    }
    public InsertElementClick() {
        this.MenuService.OpenInsertElementMenu();
    }

    private buildToggler(navID) {
        var self = this;
        return () => {
            self.$mdSidenav(navID)
                .toggle()
                .then(function () {
        });
    }
}
}