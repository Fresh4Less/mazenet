/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../../typings/tsd.d.ts" />

import IActivePageService = require("../../../services/Pages/Interfaces/IActivePageService");
import ISocketService = require("../../../services/Interfaces/ISocketService");
import MzPosition = require("../../../models/MzPosition");
import Page = require("../../../models/Pages/Page");
import IScreenPositioningService = require("../../../services/Interfaces/IScreenPositioningService");

export = LinkElementController;

class LinkElementController {

    static $inject = [
        'ActivePageService',
        'SocketService',
        'ScreenPositioningService'
    ];

    constructor(private ActivePageService:IActivePageService,
                private SocketService:ISocketService,
                private ScreenPositioningService:IScreenPositioningService) {
    }

    public EnterPage = function($event:MouseEvent, pId:number) {
        var id:number = pId;

        if(!pId) {
            id = this.ActivePageService.RootPages.root;
        }

        var pos = <MzPosition>{
            x: $event.clientX / this.ScreenPositioningService.GetMazenetWidth(),
            y: ($event.clientY - this.ScreenPositioningService.GetControlBarHeight()) / this.ScreenPositioningService.GetMazenetHeight()
        };
        console.log(pos);
        this.SocketService.EnterPage(id, pos).then(function(data:Page) {
            //Success :)
        }, function(error) {
            console.error('Error entering page:', id, error);
            alert("Unable To Enter Page.\n" + error.message);
        });
    };

}