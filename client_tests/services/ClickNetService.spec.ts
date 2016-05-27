/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../typings/tsd.d.ts" />

import mazenet = require('mazenet');
import IClickNetService = require("../../client/services/interfaces/IClickNetService");

describe('Unit: UserService', ()=> {

    var $rootScope:ng.IRootScopeService;
    var ClickNetService:IClickNetService;

    beforeEach((done)=>{
        mazenet;
        module('mazenet'); //Just accept this error. It works.
        inject((_$rootScope_:ng.IRootScopeService, _ClickNetService_:IClickNetService)=> {
            $rootScope = _$rootScope_;
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
        var mouseEvent:MouseEvent = new MouseEvent('click');
        promise.then((event)=>{
            expect(event).toEqual(mouseEvent);
            done();
        });
        ClickNetService.ResolveClick(mouseEvent);
        expect(ClickNetService.AwaitingClick).toBeFalsy();
        $rootScope.$digest();
    });
    it('should do nothing if the promise never existed', ()=>{
        var mouseEvent:MouseEvent = new MouseEvent('click');
        ClickNetService.ResolveClick(mouseEvent);
    });
    it('should reject a promise if it was cancelled', (done)=> {
        var promise:ng.IPromise<MouseEvent> = ClickNetService.RequestClick();
        promise.catch((msg)=>{
            expect(msg).toEqual('cancelled');
            done();
        });
        ClickNetService.CancelClick();
        expect(ClickNetService.AwaitingClick).toBeFalsy();
        $rootScope.$digest();
    });
    it('should do nothing if the promise never existed', ()=> {
       ClickNetService.CancelClick();
    });

});