/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../../typings/tsd.d.ts" />

import Page = require("../../../models/Pages/Page");
import IActivePageService = require("../../../services/Pages/Interfaces/IActivePageService");
import ICursorService = require("../../../services/Cursors/Interfaces/ICursorService");
import ISocketService = require("../../../services/Interfaces/ISocketService");

export = RoomSettingsMenuController;

class RoomSettingsMenuController {

    public page:Page;
    public linkText:string;

    static $inject = [
        'ActivePageService',
        'SocketService',
        'CursorService'
    ];

    constructor(private ActivePageService:IActivePageService,
                private SocketService:ISocketService,
                public CursorService:ICursorService) {
        this.page = ActivePageService.PageData;
        this.linkText = 'Waiting on Elliot...';
    }
    public ApplyRoomChanges() {
        this.SocketService.UpdatePage(this.page);
    }
}