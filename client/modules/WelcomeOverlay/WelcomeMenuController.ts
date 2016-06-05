/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../typings/tsd.d.ts" />

import ISocketService = require("../../services/interfaces/ISocketService");
export = WelcomeMenuController;

class WelcomeMenuController {

    static $inject = [
        '$scope',
        'SocketService'
    ];

    constructor(private $scope:ng.IScope,
                public SocketService:ISocketService) {
    }

    public EnterMazenet() {
        if(this.SocketService.InitialLoadComplete) {
        }
    }

}