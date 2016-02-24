/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../../typings/tsd.d.ts" />

import IMenuService = require("../../../services/Interfaces/IMenuService");
import ISocketService = require("../../../services/Interfaces/ISocketService");
export = WelcomeMenuController;

class WelcomeMenuController {

    static $inject = [
        '$scope',
        'MenuService',
        'SocketService'
    ];

    constructor(private $scope:ng.IScope,
                private MenuService:IMenuService,
                public SocketService:ISocketService) {
    }

    public EnterMazenet() {
        if(this.SocketService.InitialLoadComplete) {
            this.MenuService.CloseAllMenus();
        }
    }

}