/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../typings/index.d.ts" />

export = IClickNetService;

interface IClickNetService {
    AwaitingClick:boolean;
    RequestClick:()=>ng.IPromise<MouseEvent>;
    ResolveClick:(MouseEvent)=>void;
    CancelClick:()=>void;
}