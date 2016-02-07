/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../typings/tsd.d.ts" />
import mazenet = require('mazenet');

describe('Unit: RootController', ()=> {
    beforeEach(()=>{
        console.log('MAZNET', mazenet);
       //angular.module('mazenet');
    });
    it('should have a RootController', ()=> {
       inject(($controller)=> {
           try{
               var controller = $controller('RootController');
               expect(controller).toBeDefined();
           } catch(e) {
               fail();
           }
       });
    });
    it('should also fail', ()=>{
        fail();
    });
});

