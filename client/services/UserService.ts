/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../typings/tsd.d.ts" />
import UserData = require("./../models/UserData");
import Cursor = require("./../models/Cursors/Cursor");
import IUserService = require('./Interfaces/IUserService');

export = UserService

class UserService implements IUserService {
    static name:string = "UserService";
    public UserData: UserData;
    public OtherUsers: { [id: string] : UserData; };
    public RedrawCallback:()=>void;

    static FactoryDefinition = [()=>{return new UserService()}];

    constructor() {
        this.UserData = new UserData;
        this.OtherUsers = {};
    }
    public AddUser(user:UserData) {
        if(user && user.uId) {
            this.OtherUsers[user.uId] = user;
            this.redraw();
        }
    };
    public RemoveUser(user:UserData){
        if(user && user.uId) {
            delete this.OtherUsers[user.uId];
            this.redraw();
        }
    };
    public SetUsers(users:UserData[]){
        this.OtherUsers = {};
        var self = this;
        users.forEach(function(user) {
            self.OtherUsers[user.uId] = user;
        });
        this.redraw();
    };
    public GetUserById(id:string):UserData {
        return this.OtherUsers[id];
    };
    public UpdatePosition(cursor:Cursor) {
        if(this.OtherUsers[cursor.uId]){
            this.OtherUsers[cursor.uId].pos.x = cursor.pos.x;
            this.OtherUsers[cursor.uId].pos.y = cursor.pos.y;
        }
        this.redraw();
    };


    private redraw() {
        if(this.RedrawCallback) {
            this.RedrawCallback();
        }
    };
}