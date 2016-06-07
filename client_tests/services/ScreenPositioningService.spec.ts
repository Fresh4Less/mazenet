/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../typings/index.d.ts" />

import mazenet = require('mazenet');
import IScreenPositioningService = require("../../client/services/interfaces/IScreenPositioningService");

describe('Unit: UserService', ()=> {
    var $rootScope:ng.IRootScopeService;
    var ScreenPositioningService:IScreenPositioningService;

    beforeEach((done)=>{
        mazenet;
        module('mazenet'); //Just accept this error. It works.
        inject((_$rootScope_:ng.IRootScopeService, _ScreenPositioningService_:IScreenPositioningService)=> {
            $rootScope = _$rootScope_;
            ScreenPositioningService = _ScreenPositioningService_;
            done();
        });
    });
    it('should be defined', ()=>{
        expect(ScreenPositioningService).toBeDefined();
    });
    it('should have initialized stuff to zero', ()=> {
       expect(ScreenPositioningService.GetControlBarHeight()).toEqual(0);
       expect(ScreenPositioningService.GetMazenetHeight()).toEqual(0);
       expect(ScreenPositioningService.GetMazenetWidth()).toEqual(0);
    });
    it('should set the controlbar height', ()=> {
        ScreenPositioningService.SetControlBarHeight(123);
        expect(ScreenPositioningService.GetControlBarHeight()).toEqual(123);
        ScreenPositioningService.SetControlBarHeight(321);
        expect(ScreenPositioningService.GetControlBarHeight()).toEqual(321);
    });
    it('should not set the controlbar height if zero', ()=> {
        ScreenPositioningService.SetControlBarHeight(234);
        expect(ScreenPositioningService.GetControlBarHeight()).toEqual(234);
        ScreenPositioningService.SetControlBarHeight(0);
        expect(ScreenPositioningService.GetControlBarHeight()).toEqual(234);
    });
    it('should set the mazenet height', ()=> {
        ScreenPositioningService.SetMazenetHeight(123);
        expect(ScreenPositioningService.GetMazenetHeight()).toEqual(123);
        ScreenPositioningService.SetMazenetHeight(321);
        expect(ScreenPositioningService.GetMazenetHeight()).toEqual(321);
    });
    it('should not set the mazenet height if zero', ()=> {
        ScreenPositioningService.SetMazenetHeight(234);
        expect(ScreenPositioningService.GetMazenetHeight()).toEqual(234);
        ScreenPositioningService.SetMazenetHeight(0);
        expect(ScreenPositioningService.GetMazenetHeight()).toEqual(234);
    });
    it('should set the mazenet width', ()=> {
        ScreenPositioningService.SetMazenetWidth(123);
        expect(ScreenPositioningService.GetMazenetWidth()).toEqual(123);
        ScreenPositioningService.SetMazenetWidth(321);
        expect(ScreenPositioningService.GetMazenetWidth()).toEqual(321);
    });
    it('should not set the mazenet width if zero', ()=> {
        ScreenPositioningService.SetMazenetWidth(234);
        expect(ScreenPositioningService.GetMazenetWidth()).toEqual(234);
        ScreenPositioningService.SetMazenetWidth(0);
        expect(ScreenPositioningService.GetMazenetWidth()).toEqual(234);
    });
});