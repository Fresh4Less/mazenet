/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../typings/tsd.d.ts" />

import IActivePageService = require("../services/Pages/Interfaces/IActivePageService");
import IUserService = require("../services/Interfaces/IUserService");
import Page = require("../models/Pages/Page");
import CursorFrame = require("../models/Cursors/CursorFrame");
import UserData = require("../models/UserData");
import ICursorService = require("../services/Cursors/Interfaces/ICursorService");
import UserService = require("../services/UserService");

export = MazenetController;

class MazenetController {
    public Page:Page;
    public OtherUsers:{ [id: string] : UserData; };

    static $inject = [
        '$scope',
        '$window',
        'CursorService',
        'ActivePageService',
        'UserService'
    ];

    constructor(private $scope:ng.IScope,
                private $window:ng.IWindowService,
                private CursorService:ICursorService,
                private ActivePageService:IActivePageService,
                private UserService:IUserService) {
        this.Page = ActivePageService.PageData;
        this.OtherUsers = UserService.OtherUsers;
        UserService.RedrawCallback = ()=>{$scope.$apply()};
    }

    public CursorMove($event:MouseEvent) {
        this.CursorService.UserMovedCursor($event);
    }
}