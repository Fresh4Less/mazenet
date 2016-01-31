/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../typings/tsd.d.ts" />
import UserData = require("./../../models/UserData");
import Cursor = require("./../../models/Cursor");

export = IUserService;

interface IUserService {
    UserData: UserData;
    OtherUsers:  { [id: string] : UserData; };
    AddUser(user:UserData);
    RemoveUser(user:UserData);
    SetUsers(users:UserData[]);
    GetUserById(id:string):UserData;
    UpdatePosition(cursor:Cursor);
}