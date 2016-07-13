/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../../typings/index.d.ts" />

import Page = require("../../../models/pages/Page");
export = RoomPreviewController;

class RoomPreviewController {

    public previewRoom:Page;

    static $inject = [];
    constructor() {}

    public GetLinkColor():string {
        if(this.previewRoom || this.previewRoom.background || this.previewRoom.background.data) {
            return this.previewRoom.background.data.GetHighContrastBWHex();
        }
        return "#ffffff"
    }
}