/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../../typings/index.d.ts" />

import Page = require("../../../models/pages/Page");
import IActivePageService = require("../../../services/pages/interfaces/IActivePageService");
import ICursorService = require("../../../services/cursors/interfaces/ICursorService");
import ISocketService = require("../../../services/interfaces/ISocketService");

export = RoomSettingsMenuController;

class RoomSettingsMenuController {

    public page:Page;
    public editingPage:Page;
    public pendingResponse:boolean;
    private HTMLColors:string[];
    private HTMLColorsLower:string[];

    static $inject = [
        '$rootScope',
        'ActivePageService',
        'SocketService',
        'CursorService'
    ];

    constructor(private $rootScope:ng.IRootScopeService,
                private ActivePageService:IActivePageService,
                private SocketService:ISocketService,
                public CursorService:ICursorService) {

        this.page = this.ActivePageService.PageData;
        this.reset();

        var self = this;
        this.$rootScope.$on('activePageChanged',()=>{
            self.reset();
        });

        this.pendingResponse = false;
    }

    private reset() {
        this.editingPage = this.ActivePageService.PageData.CloneBasic();
    }

    public ApplyRoomChanges() {
        this.pendingResponse = true;
        var promise:angular.IPromise<Page> = this.SocketService.UpdatePage(this.editingPage);
        promise.finally(() => {
            this.pendingResponse = false;
        });
    }

}