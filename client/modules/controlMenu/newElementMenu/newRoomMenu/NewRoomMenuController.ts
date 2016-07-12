/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../../../typings/index.d.ts" />

import IActivePageService = require("../../../../services/pages/interfaces/IActivePageService");
declare var $;

import IUserService = require("../../../../services/interfaces/IUserService");
import UserData = require("../../../../models/UserData");
import IClickNetService = require("../../../../services/interfaces/IClickNetService");
import IElement = require("../../../../models/interfaces/IElement");
import ISocketService = require("../../../../services/interfaces/ISocketService");
import Page = require("../../../../models/pages/Page");

export = NewRoomMenuController;

class NewRoomMenuController {

    public pageToMake:Page;
    public pageLinkText:string;
    public formFilled:boolean;
    public linkDuplicateExists:boolean;
    public settingsExpanded:boolean;

    static $inject = [  '$scope',
                        '$timeout',
                        '$mdSidenav',
                        'ClickNetService',
                        'SocketService',
                        'ActivePageService',
                        'UserService'];

    constructor(private $scope:ng.IScope,
                private $timeout:ng.ITimeoutService,
                private $mdSidenav:ng.material.ISidenavService,
                private ClickNetService:IClickNetService,
                private SocketService:ISocketService,
                private ActivePageService:IActivePageService,
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
                    self.resetData();
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

    public validateLinkText() {

        if(this.pageLinkText && this.pageLinkText.length > 0) {
            if(this.ActivePageService.ContainsLinkOfName(this.pageLinkText)) {

                (<any> this.$scope).newRoomForm.linkText.$setValidity("duplicateLink", false);
            } else {
                (<any> this.$scope).newRoomForm.linkText.$setValidity("duplicateLink", true);
                this.formFilled = true;
                return;
            }
        }
        this.formFilled = false;
    }

    private resetData() {
        this.pageToMake = new Page();
        this.pageToMake.title = 'New Room';
        this.pageToMake.creator = this.UserService.UserData.uId;
        this.pageToMake.owners.push(this.UserService.UserData.uId);
        this.pageLinkText = '';
        this.formFilled = false;
        this.linkDuplicateExists = false;
    }

}