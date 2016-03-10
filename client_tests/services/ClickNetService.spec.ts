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
    });

});