/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../typings/tsd.d.ts" />

export = IMenuService;

interface IMenuService {
    MenuState:string;
    OpenRoomMenu():void;
    OpenTunnelMenu():void;
    OpenInsertElementMenu():void;
    CloseAllMenus():void;
}