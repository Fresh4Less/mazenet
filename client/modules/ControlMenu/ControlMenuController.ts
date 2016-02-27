/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../typings/tsd.d.ts" />

import $ = require('jquery');
import ISocketService = require("../../services/Interfaces/ISocketService");
import IActivePageService = require("../../services/Pages/Interfaces/IActivePageService");
import IUserService = require("../../services/Interfaces/IUserService");
import ICursorService = require("../../services/Cursors/Interfaces/ICursorService");
import IElement = require("../../models/Interfaces/IElement");
import Page = require("../../models/Pages/Page");
import IClickNetService = require("../../services/Interfaces/IClickNetService");

export = ControlMenuController;

class ControlMenuController {

    public page:Page;
    public ActiveMenu:string;
    private controlMenu:HTMLElement;
    private controlPanel:HTMLElement;

    static $inject = [
        '$scope',
        '$timeout',
        '$mdSidenav',
        'ActivePageService',
        'UserService',
        'CursorService',
        'ClickNetService'
    ];

    constructor(private $scope:ng.IScope,
                private $timeout:ng.ITimeoutService,
                private $mdSidenav:ng.material.ISidenavService,
                private ActivePageService:IActivePageService,
                private UserService:IUserService,
                private CursorService:ICursorService,
                public ClickNetService:IClickNetService) {
        this.page = ActivePageService.PageData;
        this.ActiveMenu = 'none';
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

    public RoomInfoClick() {
        this.ToggleLeft();
        this.ActiveMenu = 'info';
    }

    public TunnelRoomClick() {
        this.ToggleRight();
        this.ActiveMenu = 'newElement';
    }
    public RoomSettingsClick() {
        this.ToggleRight();
        this.ActiveMenu = 'settings';
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