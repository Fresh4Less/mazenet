/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../typings/tsd.d.ts" />

import IPromiseMapper = require("./../Interfaces/IPromiseMapper");

export = PromiseMapper;

class PromiseMapper<T> implements IPromiseMapper<T> {

    private promiseContainer:any;
    private idCounter:number;

    constructor() {
        this.promiseContainer = {};
        this.idCounter = 0;
    }

    GetNewId() {
        this.idCounter++;

        return 'id'+ this.idCounter;
    }

    GetDeferredForId(id:string):angular.IDeferred<T> {

        var promise = this.promiseContainer[id];

        if(promise) {
            delete this.promiseContainer[id];
        }

        return promise;
    }
    SetDeferredForId(id:string, promise:angular.IDeferred<T>) {
        if(this.promiseContainer[id]) {
            throw new Error('Promise already exist for given ID');
        } else {
            this.promiseContainer[id] = promise;
        }
    }
}