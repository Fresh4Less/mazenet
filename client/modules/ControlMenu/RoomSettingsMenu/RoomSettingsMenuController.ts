/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../../typings/tsd.d.ts" />

import Page = require("../../../models/Pages/Page");
import IActivePageService = require("../../../services/Pages/Interfaces/IActivePageService");

export = RoomSettingsMenuController;

class RoomSettingsMenuController {

    public page:Page;

    static $inject = [
        'ActivePageService'
    ];

    constructor(private ActivePageService:IActivePageService) {
        this.page = ActivePageService.PageData;
    }
}