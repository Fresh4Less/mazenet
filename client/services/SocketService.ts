/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../typings/tsd.d.ts" />
import CursorFrame = require("../models/Cursors/CursorFrame");
declare var io:(string)=>SocketIO.Socket;

import IElement = require('./../models/Interfaces/IElement');
import ISocketService = require("./Interfaces/ISocketService");
import MzPosition = require('./../models/MzPosition');
import Cursor = require('./../models/Cursors/Cursor');
import Page = require('./../models/Pages/Page');
import IUserService = require('./Interfaces/IUserService');
import IActivePageService = require("./Pages/Interfaces/IActivePageService");

export = SocketService;

class SocketService implements ISocketService {
    static name:string = "SocketService";
    private socket:SocketIO.Socket;
    private pageEnterPromise:angular.IDeferred<Page> = null;
    private elementCreatePromise:angular.IDeferred<IElement> = null;

    static $inject = [
        '$q',
        '$http',
        '$location',
        'UserService',
        'ActivePageService'
    ];
    constructor(private $q:angular.IQService,
                private $http:angular.IHttpService,
                private $location:angular.ILocationService,
                private UserService:IUserService,
                private ActivePageService:IActivePageService){
    }
    public Init() {
        if(!this.socket || !this.socket.connected) {
            this.socket = io('http://'+ this.$location.host() +':' + this.$location.port() + '/mazenet');
            this.socket.on('users/connected', this.connected);
            this.socket.on('users/connected:failure', this.connectError);
            this.socket.on('pages/userEntered', this.userEntered);
            this.socket.on('pages/userLeft', this.userLeft);
            this.socket.on('pages/cursors/moved', this.userMovedCursor);
            this.socket.on('pages/enter:success', this.userEnterPage);
            this.socket.on('pages/enter:failure', this.userEnterPageFailure);
            this.socket.on('pages/elements/created', this.elementCreated);
            this.socket.on('pages/element/create:failure', this.elementCreateFailure);
            this.socket.on('pages/updated', this.pageUpdated);
            this.socket.on('pages/update:failure', this.pageUpdateFailure);
        }
    }
    public EnterPage(pageId:string, pos:MzPosition) {
        this.pageEnterPromise = this.$q.defer();
        var startPage = { //TODO Consider Refactoring
            pId: pageId,
            pos: {
                x: pos.x,
                y: pos.y
            }
        };
        this.socket.emit('pages/enter', startPage);
        return this.pageEnterPromise.promise;
    }

    public UpdatePage(pageData:Page) {
        this.socket.emit('pages/update', pageData);
    }

    public CreateElement(element:IElement) {
        this.elementCreatePromise = this.$q.defer();

        this.socket.emit('pages/elements/create', element);

        return this.elementCreatePromise.promise;
    }

    public CursorMove(cursor:CursorFrame) {
        this.socket.emit('pages/cursors/moved', cursor);
    }

    /* Event Handlers */
    private connected = function(user) {
        this.UserService.UserData.uId = user.uId;
        this.ActivePageService.RootPages.root = user.rootPageId;
        this.ActivePageService.RootPages.homepage = user.homepageId;
        this.loadInitialPage();
    };
    private connectError = function(error) {
        console.error("Could not connect to the Mazenet.", error);
    };
    private userEntered = function(user) {
        this.UserService.AddUser(user);
    };
    private userLeft = function(user) {
        this.UserService.RemoveUser(user);
    };
    private userMovedCursor = function(cursor) {
        this.UserService.UpdatePosition(cursor);
    };
    private userEnterPage = function(PageData) {
        this.$location.path('room/'+PageData.page._id);
        this.ActivePageService.UpdatePage(PageData.page);
        this.UserService.SetUsers(PageData.users);
        this.pageEnterPromise.resolve(PageData);
    };
    private userEnterPageFailure = function(error) {
        this.pageEnterPromise.reject(error);
    };
    private elementCreated = function(element) {
        this.ActivePageService.AddElement(element);
        this.elementCreatePromise.resolve(element);
    };
    private elementCreateFailure = function(error) {
        this.elementCreatePromise.reject(error);
    };
    private pageUpdated = function(pageChanges) {
        this.ActivePageService.UpdatePage(pageChanges);
    };
    private pageUpdateFailure = function(error) {
        console.error('Error updating page.', error);
    };
}