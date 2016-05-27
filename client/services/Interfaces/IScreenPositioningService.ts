/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../typings/tsd.d.ts" />

export = IScreenPositioningService;

interface IScreenPositioningService {
    SetMazenetWidth(width:number):void;
    SetMazenetHeight(height:number):void;
    GetMazenetWidth():number;
    GetMazenetHeight():number;
    SetControlBarHeight(height:number):void;
    GetControlBarHeight():number;
}