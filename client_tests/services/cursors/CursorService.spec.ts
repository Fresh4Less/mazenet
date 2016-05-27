/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../typings/tsd.d.ts" />

import mazenet = require('mazenet');
import ICursorService = require("../../../client/services/cursors/Interfaces/ICursorService");
import IDrawMode = require("../../../client/models/DrawModes/Interfaces/IDrawMode");
import IActivePageService = require("../../../client/services/pages/Interfaces/IActivePageService");
import ISocketService = require("../../../client/services/interfaces/ISocketService");
import {underline} from "colors";
import CursorFrame = require("../../../client/models/Cursors/CursorFrame");

describe('Unit: CursorService', ()=> {

    var $rootScope:ng.IRootScopeService;
    var CursorService:ICursorService;
    var ActivePageService:IActivePageService;
    var SocketService:ISocketService;
    var MockSocketService = {
        cursorMoveCallback: null,
        CursorMove: function (cursorFrame) {
            if (this.cursorMoveCallback) {
                this.cursorMoveCallback(cursorFrame);
            }
        }
    };

    beforeEach((done)=>{
        mazenet;
        module('mazenet', ($provide:any) => {
            $provide.value('SocketService', MockSocketService);
        });
        inject((_$rootScope_:ng.IRootScopeService, _CursorService_:ICursorService) => {
            $rootScope = _$rootScope_;
            CursorService = _CursorService_;
            done();
        });
    });
    it('should be defined', ()=>{
        expect(CursorService).toBeDefined();
    });
    it('should have an initial draw mode', ()=> {
        var drawMode:IDrawMode = CursorService.DrawMode;
        expect(drawMode).toBeDefined();
        expect(drawMode.name).toBeTruthy();
        expect(drawMode.mode).toBeTruthy();
        expect(drawMode.playback).toBeTruthy();
        expect(drawMode.cumulative).toBeDefined();
        expect(drawMode.data).toBeDefined();
    });
    it('should cycle without anything breaking', ()=> {
        CursorService.CycleDrawMode();
        var drawMode:IDrawMode = CursorService.DrawMode;
        expect(drawMode).toBeDefined();
        expect(drawMode.name).toBeTruthy();
        expect(drawMode.mode).toBeTruthy();
        expect(drawMode.playback).toBeTruthy();
        expect(drawMode.cumulative).toBeDefined();
        expect(drawMode.data).toBeDefined();
    });
    it('should change the draw mode on cycle', ()=> {
        var oldName = CursorService.DrawMode.name;
        CursorService.CycleDrawMode();
        expect(CursorService.DrawMode.name).not.toEqual(oldName);
    });
    it('should eventually cycle back', ()=> {
        var firstName:string = CursorService.DrawMode.name;
        var attempts:number = 1000;
        while(attempts) {
            CursorService.CycleDrawMode();
            if(CursorService.DrawMode.name === firstName) {
                break;
            }
            attempts--;
        }
        if(attempts === 0) {
            fail();
        }
    });
    it('should call the cycle callback on cycle', (done)=> {
        CursorService.OnCycleDrawMode(()=> {
            done();
        });
        CursorService.CycleDrawMode();
    });
    it('should not do anything if the callback set is wrong', (done) => {
        CursorService.OnCycleDrawMode(()=> {
            done();
        });
        CursorService.OnCycleDrawMode('Im not a function');
        CursorService.CycleDrawMode();
    });
    it('calling move on crap input should not move the cursor', ()=> {
        MockSocketService.cursorMoveCallback = (cursorFrame) => {
            fail()
        };
        CursorService.UserMovedCursor(null);

    });
    it('should call the SocketService cursor move on move', (done)=>{
        var mouseEvent:any = {
           srcElement: {
               clientWidth: 100,
               clientHeight: 100
           },
           layerX: 50,
           layerY: 50
        };
        var expectedCursorMove:CursorFrame = {
            pos: {
                x: 0.5,
                y: 0.5
            },
            t: 0
        };
        MockSocketService.cursorMoveCallback = (cursorFrame:CursorFrame) => {
            expect(cursorFrame.pos).toEqual(expectedCursorMove.pos);
            done();
        };
        CursorService.UserMovedCursor(mouseEvent);
    });
    it('should not let two moves be called in super quick succession', ()=> {
        var mouseEvent:any = {
            srcElement: {
                clientWidth: 100,
                clientHeight: 100
            },
            layerX: 50,
            layerY: 50
        };
        var expectedCursorMove:CursorFrame = {
            pos: {
                x: 0.5,
                y: 0.5
            },
            t: 0
        };
        MockSocketService.cursorMoveCallback = (cursorFrame:CursorFrame) => {
            expect(cursorFrame.pos).toEqual(expectedCursorMove.pos);
        };
        CursorService.UserMovedCursor(mouseEvent);
        MockSocketService.cursorMoveCallback = (cursorFrame) => {
            fail();
        };
        CursorService.UserMovedCursor(mouseEvent); //If this doesn't get called within 1/30th of a second then it might fail. Idk how to structure this test better.
    })

});