/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../../typings/tsd.d.ts" />

import Page = require("../../../models/Pages/Page");
import IActivePageService = require("../../../services/Pages/Interfaces/IActivePageService");
import ICursorService = require("../../../services/Cursors/Interfaces/ICursorService");

export = RoomSettingsMenuController;

class RoomSettingsMenuController {

    public page:Page;

    static $inject = [
        'ActivePageService',
        'CursorService'
    ];

    constructor(private ActivePageService:IActivePageService,
                public CursorService:ICursorService) {
        this.page = ActivePageService.PageData;
    }
}