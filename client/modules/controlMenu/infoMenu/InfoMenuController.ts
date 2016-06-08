/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../../typings/index.d.ts" />

import IActivePageService = require("../../../services/pages/interfaces/IActivePageService");
import Page = require("../../../models/pages/Page");

export = InfoMenuController;

class InfoMenuController {

    public page:Page;

    static $inject =['ActivePageService'];

    constructor(private ActivePageService:IActivePageService){
        this.page = ActivePageService.PageData;
    }
}