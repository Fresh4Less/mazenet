/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../typings/tsd.d.ts" />
import IElement = require("./../Interfaces/IElement");
import IBackground = require("./../Interfaces/IBackground");
import AnimatedCursor = require("./../Cursors/AnimatedCursor");

export = Page;

class Page {
    public _id:string;
    public creator:string;
    public owners:string[];
    public permissions:string;
    public title:string;
    public elements:IElement[];
    public background:IBackground;
    public cursors:AnimatedCursor[];

    /*client-side only*/
    public enterTime;

    constructor() {
        this.resetPage();
    }

    public UpdatePage(otherPage:Page) {
        if(otherPage) {
            //Id
            if(otherPage._id != this._id) {
                throw "cannot UpdatePage with a different page. Use LoadPage instead"
            }
            if(otherPage.creator) {
                this.creator = otherPage.creator;
            }
            if(otherPage.permissions) {
                this.permissions = otherPage.permissions;
            }
            if(otherPage.title) {
                this.title = otherPage.title;
            }
            if(otherPage.background){
                this.background.bType = otherPage.background.bType;
                this.background.data = angular.copy(otherPage.background.data);
            }
            if(otherPage.owners) {
                this.owners = otherPage.owners;
            }
            if(otherPage.elements) {
                this.elements = angular.copy(otherPage.elements);
            }
            if(otherPage.cursors) {
                this.cursors = angular.copy(otherPage.cursors);
            }
            this.enterTime = (new Date()).getTime();
        } else {
            throw "cannot UpdatePage undefined page"
        }
    }
    public LoadPage(otherPage:Page) {
        if(otherPage) {
            if(otherPage._id) {
                this.resetPage();
                this._id = otherPage._id;
                this.UpdatePage(otherPage);
            } else {
                throw "cannot LoadPage page contains no _id"
            }
        } else {
            throw "cannot LoadPage page undefined";
        }
    }

    private resetPage() {
        this._id = '0';
        this.creator = null;
        this.permissions = 'all';
        this.title = 'loading...';
        this.background = {
            bType: 'color',
            data: {
                color: '#333333'
            }
        };
        this.owners = [];
        this.elements = [];
        this.cursors = [];
        this.enterTime = (new Date()).getTime();
    }

}