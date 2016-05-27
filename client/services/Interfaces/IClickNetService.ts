/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../typings/tsd.d.ts" />

export = IClickNetService;

interface IClickNetService {
    AwaitingClick:boolean;
    RequestClick:()=>ng.IPromise<MouseEvent>;
    ResolveClick:(MouseEvent)=>void;
    CancelClick:()=>void;
}