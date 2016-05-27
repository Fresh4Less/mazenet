/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../../typings/tsd.d.ts" />

import IUserService = require("../../../services/interfaces/IUserService");
import UserData = require("../../../models/UserData");

export = UserMenuController;

class UserMenuController {

    public User:UserData;
    public username:string;
    public password:string;
    public OtherUsers:UserData[];

    static $inject = ['UserService'];

    constructor(private UserService:IUserService) {
        this.User = UserService.UserData;
        this.OtherUsers = [];//TODO translate the other users into an array.
    }
    public IsLoggedIn():boolean {
        return false;
    }
    public GetName():string {
        if(this.IsLoggedIn()) {
            return this.User.username;
        } else {
            return 'Anonymous';
        }
    }
    public Login(){
        console.log('login! Hooray!')
    }

}