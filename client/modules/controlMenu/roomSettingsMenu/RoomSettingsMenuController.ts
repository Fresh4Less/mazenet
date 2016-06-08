/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../../typings/index.d.ts" />

import Page = require("../../../models/pages/Page");
import IActivePageService = require("../../../services/pages/interfaces/IActivePageService");
import ICursorService = require("../../../services/cursors/interfaces/ICursorService");
import ISocketService = require("../../../services/interfaces/ISocketService");

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