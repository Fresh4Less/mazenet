/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../typings/index.d.ts" />

declare var $;
import ISocketService = require("../../services/interfaces/ISocketService");
import IActivePageService = require("../../services/pages/interfaces/IActivePageService");
import IUserService = require("../../services/interfaces/IUserService");
import ICursorService = require("../../services/cursors/interfaces/ICursorService");
import IElement = require("../../models/interfaces/IElement");
import Page = require("../../models/pages/Page");
import IClickNetService = require("../../services/interfaces/IClickNetService");

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
        'ClickNetService'
    ];

    constructor(private $scope:ng.IScope,
                private $timeout:ng.ITimeoutService,
                private $mdSidenav:ng.material.ISidenavService,
                private ActivePageService:IActivePageService,
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

    public NewElementClick() {
        this.ToggleRight();
        this.ActiveMenu = 'newElement';
    }
    public RoomSettingsClick() {
        this.ToggleRight();
        this.ActiveMenu = 'roomSettings';
    }

    public UserSettingsClick() {
        this.ToggleRight();
        this.ActiveMenu = 'userSettings';
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