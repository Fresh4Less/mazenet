/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../typings/index.d.ts" />

export = IPromiseMapper;

interface IPromiseMapper<T> {

    GetNewId():string;
    GetDeferredForId(id:string):angular.IDeferred<T>;
    SetDeferredForId(id:string, promise:angular.IDeferred<T>);
}