/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../typings/tsd.d.ts" />

import $ = require('jquery');
import ISocketService = require("../../services/Interfaces/ISocketService");
import IActivePageService = require("../../services/Pages/Interfaces/IActivePageService");
import IUserService = require("../../services/Interfaces/IUserService");
import ICursorService = require("../../services/Cursors/Interfaces/ICursorService");
import IElement = require("../../models/Interfaces/IElement");
import Page = require("../../models/Pages/Page");

export = ControlMenuController;

class ControlMenuController {

    public state:string;
    public page:Page;
    private controlMenu:HTMLElement;
    private controlPanel:HTMLElement;

    static $inject = [
        '$timeout',
        'ActivePageService',
        'UserService',
        'CursorService'
    ];

    constructor(private $timeout:ng.ITimeoutService,
                private ActivePageService:IActivePageService,
                private UserService:IUserService,
                private CursorService:ICursorService) {
        this.state = 'welcome';
        this.page = ActivePageService.PageData;
        var self = this;
        $timeout(function() {
            self.controlMenu = angular.element( document.querySelector( '#TheControlMenu' ) )[0];
            self.controlPanel = angular.element( document.querySelector( '#TheControlPanel' ) )[0];
            $(window).bind('resize.controlmenu', ()=>{self.updateMaxHeight();});
        });
    }

    public RoomNameClick() {
        if(this.state === 'welcome') {
            this.state = 'none'
        } else {
            this.state = 'welcome';
        }
    }

    public TunnelRoomClick() {
        if(this.state === 'tunnel') {
            this.state = 'none'
        } else {
            this.state = 'tunnel';
        }
    }
    public InsertElementClick() {
        if(this.state === 'insert') {
            this.state = 'none'
        } else {
            this.state = 'insert';
        }
    }

    private updateMaxHeight() {
        if(this.state === 'none') {
            this.controlPanel.style.maxHeight = '0px';
        } else {
            this.controlPanel.style.maxHeight = (window.innerHeight - this.controlMenu.offsetHeight).toString() + 'px';
        }
    }
}