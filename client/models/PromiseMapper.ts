/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../typings/tsd.d.ts" />

import IPromiseMapper = require("./Interfaces/IPromiseMapper");

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

    GetPromiseForId(id:string):angular.IDeferred<T> {
        var promise = this.promiseContainer[id];
        delete this.promiseContainer[id];
        return promise;
    }
    SetPromiseForId(id:string, promise:angular.IDeferred<T>) {
        if(this.promiseContainer[id]) {
            throw new Error('Promise already exist for given ID');
        } else {
            this.promiseContainer[id] = promise;
        }
    }
}