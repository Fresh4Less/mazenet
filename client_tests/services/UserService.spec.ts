/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../typings/tsd.d.ts" />

import mazenet = require('mazenet');

import IUserService = require("../../client/services/Interfaces/IUserService");
import UserData = require("../../client/models/UserData");
import Cursor = require("../../client/models/Cursors/Cursor");

describe('Unit: UserService', ()=> {
    var UserService:IUserService;


    beforeEach((done)=>{
        mazenet;
        module('mazenet'); //Just accept this error. It works.
        inject((_UserService_:IUserService)=> {
            UserService = _UserService_;
           done();
        });
    });
    it('should be defined', ()=>{
        expect(UserService).toBeDefined();
    });
    it('should initialize with default userdata', ()=>{
        expect(UserService.UserData).toBeDefined();
        expect(UserService.OtherUsers).toBeDefined();
    });
    it('should add another user', ()=>{
       var otherUser:UserData = {
           uId: 'abc123',
           username: 'sam',
           pos: {
               x: 0,
               y: 0
           }
       };
        UserService.AddUser(otherUser);

        expect(UserService.OtherUsers[otherUser.uId]).toBeDefined();
        expect(UserService.OtherUsers[otherUser.uId]).toEqual(otherUser);
    });
    it('should not add an undefined/null or miscreated user', ()=> {
        UserService.RedrawCallback = () => {
            fail();
        };
        UserService.AddUser(null);
        var user:UserData;
        UserService.AddUser(user);
        for(var prop in UserService.OtherUsers) {
            if(UserService.OtherUsers.hasOwnProperty(prop)) {
                fail();
            }
        }
    });
    it('should fire the redraw callback when a user is added', (done) => {
        UserService.RedrawCallback = () => {
            done()
        };
        var otherUser:UserData = {
            uId: 'abc123',
            username: 'sam',
            pos: {
                x: 0,
                y: 0
            }
        };
        UserService.AddUser(otherUser);
    });
    it('should remove a user after added', (done)=> {
        var otherUser:UserData = {
            uId: 'abc123',
            username: 'sam',
            pos: {
                x: 0,
                y: 0
            }
        };
        UserService.AddUser(otherUser);
        UserService.RedrawCallback = () => {
            done();
        };
        UserService.RemoveUser(otherUser);
    });
    it('should not remove a user if the user is undefined', ()=> {
        var otherUser:UserData = {
            uId: 'abc123',
            username: 'sam',
            pos: {
                x: 0,
                y: 0
            }
        };
        UserService.AddUser(otherUser);
        UserService.RedrawCallback = () => {
            fail();
        };
        UserService.RemoveUser(null);
        var user:UserData;
        UserService.RemoveUser(user);
        expect(UserService.OtherUsers[otherUser.uId]).toEqual(otherUser);
    });
    it('should set all the other users', ()=>{

        var otherUser1:UserData = {uId: '123456', username: 'a', pos: {x: 0, y:0}};
        var otherUser2:UserData = {uId: '654321', username: 'b', pos: {x: 0, y:0}};
        var otherUser3:UserData = {uId: '162534', username: 'c', pos: {x: 0, y:0}};
        UserService.AddUser(otherUser1);
        UserService.SetUsers([otherUser2, otherUser3]);
        expect(UserService.OtherUsers[otherUser2.uId]).toBeDefined();
        expect(UserService.OtherUsers[otherUser3.uId]).toBeDefined();
        expect(UserService.OtherUsers[otherUser1.uId]).toBeUndefined();

    });
    it('should set all the other users with a callback', (done)=>{
        UserService.RedrawCallback = () => {
            done();
        };
        var otherUser2:UserData = {uId: '654321', username: 'b', pos: {x: 0, y:0}};
        var otherUser3:UserData = {uId: '162534', username: 'c', pos: {x: 0, y:0}};
        UserService.SetUsers([otherUser2, otherUser3]);
    });
    it('should return a valid user by ID', ()=>{
        var otherUser1:UserData = {uId: '123456', username: 'a', pos: {x: 0, y:0}};
        UserService.AddUser(otherUser1);
        expect(UserService.GetUserById[otherUser1.uId]).toEqual(otherUser1);
    });
    it('should return undefined with a bad ID', ()=>{
        var otherUser1:UserData = {uId: '123456', username: 'a', pos: {x: 0, y:0}};
        UserService.AddUser(otherUser1);
        expect(UserService.GetUserById['654321']).toBeUndefined();
    });
    it('should update the position with a cursor info', ()=> {
        var cursor:Cursor = {uId: '123456', pos: {x:7, y: 9}};
        var otherUser:UserData = {uId: '123456', username: 'a', pos: {x: 0, y:0}};
        expect(UserService.OtherUsers[otherUser.uId].pos).toEqual({x: 0, y: 0});
        UserService.UpdatePosition(cursor);
        expect(UserService.OtherUsers[otherUser.uId].pos).toEqual({x: 7, y: 9});

    });





});