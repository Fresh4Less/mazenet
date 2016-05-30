/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../typings/tsd.d.ts" />

export = IPromiseMapper;

interface IPromiseMapper<T> {

    GetNewId():string;
    GetPromiseForId(id:string):angular.IDeferred<T>;
    SetPromiseForId(id:string, promise:angular.IDeferred<T>);
}