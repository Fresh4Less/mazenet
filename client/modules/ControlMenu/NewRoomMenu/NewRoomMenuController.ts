/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../../typings/tsd.d.ts" />

import $ = require('jquery');
import Page = require('../../../models/Pages/Page');
import IUserService = require("../../../services/Interfaces/IUserService");
import UserData = require("../../../models/UserData");
import IClickNetService = require("../../../services/Interfaces/IClickNetService");
import IElement = require("../../../models/Interfaces/IElement");
import {link} from "fs";
import ISocketService = require("../../../services/Interfaces/ISocketService");

export = NewRoomMenuController;

class NewRoomMenuController {

    private colorInput:any;

    public pageToMake:Page;
    public pageLinkText:string;
    public HTMLColors:string[];
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
        var wordList = ["AliceBlue","AntiqueWhite","Aqua","Aquamarine","Azure","Beige","Bisque","Black","BlanchedAlmond","Blue","BlueViolet","Brown","BurlyWood","CadetBlue","Chartreuse","Chocolate","Coral","CornflowerBlue","Cornsilk","Crimson","Cyan","DarkBlue","DarkCyan","DarkGoldenRod","DarkGray","DarkGrey","DarkGreen","DarkKhaki","DarkMagenta","DarkOliveGreen","DarkOrange","DarkOrchid","DarkRed","DarkSalmon","DarkSeaGreen","DarkSlateBlue","DarkSlateGray","DarkSlateGrey","DarkTurquoise","DarkViolet","DeepPink","DeepSkyBlue","DimGray","DimGrey","DodgerBlue","FireBrick","FloralWhite","ForestGreen","Fuchsia","Gainsboro","GhostWhite","Gold","GoldenRod","Gray","Grey","Green","GreenYellow","HoneyDew","HotPink","IndianRed","Indigo","Ivory","Khaki","Lavender","LavenderBlush","LawnGreen","LemonChiffon","LightBlue","LightCoral","LightCyan","LightGoldenRodYellow","LightGray","LightGrey","LightGreen","LightPink","LightSalmon","LightSeaGreen","LightSkyBlue","LightSlateGray","LightSlateGrey","LightSteelBlue","LightYellow","Lime","LimeGreen","Linen","Magenta","Maroon","MediumAquaMarine","MediumBlue","MediumOrchid","MediumPurple","MediumSeaGreen","MediumSlateBlue","MediumSpringGreen","MediumTurquoise","MediumVioletRed","MidnightBlue","MintCream","MistyRose","Moccasin","NavajoWhite","Navy","OldLace","Olive","OliveDrab","Orange","OrangeRed","Orchid","PaleGoldenRod","PaleGreen","PaleTurquoise","PaleVioletRed","PapayaWhip","PeachPuff","Peru","Pink","Plum","PowderBlue","Purple","RebeccaPurple","Red","RosyBrown","RoyalBlue","SaddleBrown","Salmon","SandyBrown","SeaGreen","SeaShell","Sienna","Silver","SkyBlue","SlateBlue","SlateGray","SlateGrey","Snow","SpringGreen","SteelBlue","Tan","Teal","Thistle","Tomato","Turquoise","Violet","Wheat","White","WhiteSmoke","Yellow","YellowGreen"];
        this.HTMLColors = [];
        for (var i = 0; i < wordList.length; i++) {
            this.HTMLColors.push(wordList[i].toLowerCase());
        }
    }
    public getPermissionWord() {
        if(this.pageToMake.permissions == 'all') {
            return 'anything';
        } else if(this.pageToMake.permissions == 'links') {
            return 'links';
        } else if(this.pageToMake.permissions == 'none') {
            return 'nothing';
        } else {
            return '...';
        }
    }

    public SelectPositionToTunnel() {
        var self = this;
        self.ClickNetService.RequestClick().then(($event:MouseEvent)=>{
            var pos = {
                x: $event.layerX / $event.srcElement.clientWidth,
                y: $event.layerY / $event.srcElement.clientHeight
            };
            var linkElement:IElement = {
                eType: 'link',
                creator: self.pageToMake.creator,
                pos: pos,
                data:{
                    text: self.pageLinkText
                }
            };
            console.log(linkElement);
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

    public ColorSearch(query:string):string[] {
        var results = query ? this.HTMLColors.filter( this.createFilterFor(query) ) : [];
        return results;
    }
    private createFilterFor(query:string) {
        var lowercaseQuery = angular.lowercase(query);
        return function filterFn(color) {
            return (color.indexOf(lowercaseQuery) === 0);
        };
    }
    private resetData() {
        this.pageToMake = new Page();
        this.pageToMake.title = '';
        this.pageToMake.creator = this.UserService.UserData.uId;
        this.pageToMake.owners.push(this.UserService.UserData.uId);
        this.pageLinkText = '';
    }
}