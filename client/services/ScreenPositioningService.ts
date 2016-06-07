/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../typings/index.d.ts" />

import IScreenPositioningService = require("./interfaces/IScreenPositioningService");

export = ScreenPositioningService;

class ScreenPositioningService implements IScreenPositioningService{
    private mazenetWidth:number;
    private mazenetHeight:number;
    private controlBarHeight:number;

    static moduleName:string = 'ScreenPositioningService';
    static FactoryDefinition = [
        ()=> {
            return new ScreenPositioningService();
        }
    ];
    constructor() {
        this.mazenetHeight = 0;
        this.mazenetWidth = 0;
        this.controlBarHeight = 0;
    }

    public SetMazenetWidth(width:number) {
        if(width) {
            this.mazenetWidth = width;
        }
    }
    public SetMazenetHeight(height:number) {
        if(height) {
            this.mazenetHeight = height;
        }
    }
    public GetMazenetWidth():number {
        return this.mazenetWidth;
    }
    public GetMazenetHeight():number {
        return this.mazenetHeight;
    }
    public SetControlBarHeight(height:number):void {
        if(height) {
            this.controlBarHeight = height;
        }
    }
    public GetControlBarHeight():number {
        return this.controlBarHeight;
    }
}