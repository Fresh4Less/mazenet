/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../../typings/index.d.ts" />

import IActivePageService = require("../../../services/pages/interfaces/IActivePageService");
import ISocketService = require("../../../services/interfaces/ISocketService");
import MzPosition = require("../../../models/MzPosition");
import Page = require("../../../models/pages/Page");
import IScreenPositioningService = require("../../../services/interfaces/IScreenPositioningService");
import ICursorService = require("../../../services/cursors/interfaces/ICursorService");
import ColorBgData = require("../../../models/pages/ColorBgData");
import IElement = require("../../../models/interfaces/IElement");

export = LinkElementController;

class LinkElementController {

    public element:IElement;

    static $inject = [
        'ActivePageService',
        'SocketService',
        'CursorService',
        'ScreenPositioningService'
    ];

    constructor(private ActivePageService:IActivePageService,
                private SocketService:ISocketService,
                private CursorService:ICursorService,
                private ScreenPositioningService:IScreenPositioningService) {
    }

    public GetColor():string {
        if(this.ActivePageService.PageData.background.bType === 'color') {
            if((<any> this.element.data).isReturnLink) {
                return (<ColorBgData> this.ActivePageService.PageData.background.data).GetHighContrastHex();
            }
            else {
                return (<ColorBgData> this.ActivePageService.PageData.background.data).GetOppositeColorHex();
            }
        } else {
            return '#2B4A6F';
        }
    }

    public EnterPage($event:MouseEvent, pId:string) {
        var id:string = pId;

        if(!pId) {
            id = this.ActivePageService.RootPages.root;
        }

        var pos = <MzPosition>{
            x: $event.clientX / this.ScreenPositioningService.GetMazenetWidth(),
            y: ($event.clientY - this.ScreenPositioningService.GetControlBarHeight()) / this.ScreenPositioningService.GetMazenetHeight()
        };
        this.SocketService.EnterPage(id, pos).then(function(data:Page) {
            //Success :)
        }, function(error) {
            console.error('Error entering page:', id, error);
            alert("Unable To Enter Page.\n" + error.message);
        });
    };

}