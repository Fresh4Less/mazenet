/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../typings/tsd.d.ts" />

import IClickNetService = require("./Interfaces/IClickNetService");

export = ClickNetService;

class ClickNetService implements IClickNetService {

    static name:string = 'ClickNetService';

    static FactoryDefinition = [
        '$q',
        ($q:ng.IQService)=> {
            return new ClickNetService($q);
        }
    ];

    public AwaitingClick:boolean = false;

    private clickPromise:ng.IDeferred<MouseEvent>;

    constructor(private $q:ng.IQService) {
        this.clickPromise = null;
    }

    public RequestClick():ng.IPromise<MouseEvent> {
        if(!this.clickPromise) {
            this.clickPromise = this.$q.defer();
            this.AwaitingClick = true;
        }
        return this.clickPromise.promise;
    }

    public ResolveClick($event:MouseEvent):void {
        this.clickPromise.resolve($event);
        this.clickPromise = null;
        this.AwaitingClick = false;
    }
    public CancelClick():void {
        this.clickPromise.reject('cancelled');
        this.clickPromise = null;
        this.AwaitingClick = false;
    }
}
