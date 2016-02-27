/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../../typings/tsd.d.ts" />

import IActivePageService = require("../../../services/Pages/Interfaces/IActivePageService");
import Page = require("../../../models/Pages/Page");

export = InfoMenuController;

class InfoMenuController {

    public page:Page;

    static $inject =['ActivePageService'];

    constructor(private ActivePageService:IActivePageService){
        this.page = ActivePageService.PageData;
    }
}