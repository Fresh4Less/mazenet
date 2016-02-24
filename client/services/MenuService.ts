/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../typings/tsd.d.ts" />

import IMenuService = require("./Interfaces/IMenuService");
import ISocketService = require("./Interfaces/ISocketService");

export = MenuService;

class MenuService implements IMenuService {

    static name:string = 'MenuService';

    static FactoryDefinition = [
        'SocketService',
        (SocketService:ISocketService)=>{return new MenuService(SocketService);}
    ];

    public MenuState = 'none';

    constructor(private SocketService:ISocketService) {

    }

    public OpenRoomMenu():void {
        this.MenuState = 'welcome';
    }
    public OpenTunnelMenu():void {
        this.MenuState = 'tunnel';
    }
    public OpenInsertElementMenu():void {
        this.MenuState = 'insert';
    }
    public CloseAllMenus():void {
        //this.MenuState = 'none';
    }

}