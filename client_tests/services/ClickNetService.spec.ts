/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../typings/tsd.d.ts" />

import mazenet = require('mazenet');
import IClickNetService = require("../../client/services/Interfaces/IClickNetService");

describe('Unit: UserService', ()=> {

    var ClickNetService:IClickNetService;

    beforeEach((done)=>{
        mazenet;
        module('mazenet'); //Just accept this error. It works.
        inject((_ClickNetService_:IClickNetService)=> {
            ClickNetService = _ClickNetService_;
            done();
        });
    });
    it('should be defined', ()=>{
        expect(ClickNetService).toBeDefined();
        expect(ClickNetService.AwaitingClick).toBeFalsy();
    });
    it('should return a promise after a click request', ()=> {
        var promise:ng.IPromise<MouseEvent> = ClickNetService.RequestClick();
        expect(promise).toBeDefined();
    });
    it('should return the same promise with multiple requests', ()=> {
        var promise1:ng.IPromise<MouseEvent> = ClickNetService.RequestClick();
        var promise2:ng.IPromise<MouseEvent> = ClickNetService.RequestClick();
        expect(promise1).toEqual(promise2);
    });
    it('should set awaiting click to true after a click is requested', ()=> {
       expect(ClickNetService.AwaitingClick).toBeFalsy();
        ClickNetService.RequestClick();
        expect(ClickNetService.AwaitingClick).toBeTruthy();
    });
    it('should resolve the promise with a mouseEvent', (done)=> {
        var promise:ng.IPromise<MouseEvent> = ClickNetService.RequestClick();
        var mouseEvent:MouseEvent = new MouseEvent;
        promise.then((event)=>{
            expect(event).toEqual(mouseEvent);
            done();
        })
        ClickNetService.ResolveClick(mouseEvent);
    });

});