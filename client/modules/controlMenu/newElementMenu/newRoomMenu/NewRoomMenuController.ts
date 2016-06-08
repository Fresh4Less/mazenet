/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../../../typings/index.d.ts" />

import $ = require('jquery');
import IUserService = require("../../../../services/interfaces/IUserService");
import UserData = require("../../../../models/UserData");
import IClickNetService = require("../../../../services/Interfaces/IClickNetService");
import IElement = require("../../../../models/Interfaces/IElement");
import ISocketService = require("../../../../services/Interfaces/ISocketService");
import Page = require("../../../../models/Pages/Page");

export = NewRoomMenuController;

class NewRoomMenuController {

    private colorInput:any;

    public pageToMake:Page;
    public pageLinkText:string;
    public settingsExpanded:boolean;

    static $inject = [  '$scope',
                        '$timeout',
                        '$mdSidenav',
                        'ClickNetService',
                        'SocketService',
                        'UserService'];

    constructor(private $scope:ng.IScope,
                private $timeout:ng.ITimeoutService,
                private $mdSidenav:ng.material.ISidenavService,
                private ClickNetService:IClickNetService,
                private SocketService:ISocketService,
                private UserService:IUserService) {
        this.resetData();
    }

    public SelectPositionToTunnel() {
        var self = this;
        self.ClickNetService.RequestClick().then(($event:MouseEvent)=>{
            var pgElement:any = $event.target || $event.srcElement;
            var pos = {
                x: $event.layerX / pgElement.clientWidth,
                y: $event.layerY / pgElement.clientHeight
            };
            var linkElement:IElement = {
                eType: 'link',
                creator: self.pageToMake.creator,
                pos: pos,
                data:{
                    text: self.pageLinkText
                }
            };
            self.SocketService.CreateElement(linkElement).then((element:IElement)=> {
                self.SocketService.EnterPage(element.data.pId, element.pos).then((page:Page)=>{
                    self.SocketService.UpdatePage(self.pageToMake).finally(()=>{
                        self.resetData();
                    });
                }, (error)=>{
                    self.resetData();
                });
            }, (error:any) => {
                self.$mdSidenav('right').open();
            });
        }, (error:any)=>{
            self.$mdSidenav('right').open();
        });
        self.$mdSidenav('right').close()
        .then(()=>{
        });
    };

    private resetData() {
        this.pageToMake = new Page();
        this.pageToMake.title = '';
        this.pageToMake.creator = this.UserService.UserData.uId;
        this.pageToMake.owners.push(this.UserService.UserData.uId);
        this.pageLinkText = '';
    }
}