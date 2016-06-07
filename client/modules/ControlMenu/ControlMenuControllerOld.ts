/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../typings/index.d.ts" />

import ISocketService = require("../../services/interfaces/ISocketService");
import IActivePageService = require("../../services/pages/Interfaces/IActivePageService");
import IUserService = require("../../services/interfaces/IUserService");
import ICursorService = require("../../services/cursors/Interfaces/ICursorService");
import IElement = require("../../models/Interfaces/IElement");
import Page = require("../../models/Pages/Page");
export = ControlMenuControll;

class ControlMenuControll {

    public isOpen:boolean;
    public cursorService:ICursorService;
    public tunnelingInfo:any; //TODO Refactor into a model
    public newLink:IElement;
    public pageSettings:any; //TODO figure out what model this is
    public state:string;
    public page:Page;
    public controlPanelHeight:string;

    static $inject = [
        'SocketService',
        'ActivePageService',
        'UserService',
        'CursorService'
    ];

    constructor(private SocketService:ISocketService,
                private ActivePageService:IActivePageService,
                private UserService:IUserService,
                private CursorService:ICursorService) {
        this.page = ActivePageService.PageData;
        this.cursorService = CursorService;
        this.tunnelingInfo = {
            isTunneling : false,
            text: 'NEW_LINK',
            pos: {
                x: -1,
                y: -1
            }
        };
        this.newLink = <IElement>{
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
        this.controlPanelHeight = "0%";
        var self = this;
        ActivePageService.OnAddElement((element:IElement) => {
            if(self.tunnelingInfo.pos.x == element.pos.x && self.tunnelingInfo.pos.y == element.pos.y) {
                self.tunnelingInfo.isTunneling = false;
                self.tunnelingInfo.pos.x = -1;
                self.tunnelingInfo.pos.y = -1;
            }
        });

    }

    public backToRoot() {
        this.state = "root";
    };
    public newRoomSelected() {
        this.state = "newRoom";
    };
    public pageSettingsSelected() {
        this.state = "pageSettings";
    };
    public newImageSelected() {
        this.state = "root";
    };
    public createPage() {

        //this.newLink.pos.x = this.ContextMenuService.position.x;
        //this.newLink.pos.y = this.ContextMenuService.position.y;
        this.newLink.creator = this.UserService.UserData.uId;

        this.closeContextMenu();
        this.tunnelingInfo.isTunneling = true;
        //this.tunnelingInfo.pos.x = this.ContextMenuService.position.x;
        //this.tunnelingInfo.pos.y = this.ContextMenuService.position.y;
        this.tunnelingInfo.text = this.newLink.data.text;
        this.SocketService.CreateElement(this.newLink);
    };

    public updatePage() {
        this.SocketService.UpdatePage(this.pageSettings);
    };

    public closeContextMenu() {
        //this.ContextMenuService.forceClose = true;
    };
     private resetLocalData = function() {
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
                bType : this.ActivePageService.PageData.background.bType,
                data : {
                    color : this.ActivePageService.PageData.background.data.color
                }
            }
        };
    };
}