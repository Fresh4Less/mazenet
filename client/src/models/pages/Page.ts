/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */

import { IElement } from '../interfaces/IElement';
import { IBackground } from './interfaces/IBackground';
import { AnimatedCursor } from '../cursors/AnimatedCursor';
import { ColorBgData } from './ColorBgData';

export class Page {

    public _id: string;
    public creator: string;
    public owners: string[];
    public permissions: string;
    public title: string;
    public elements: IElement[];
    public background: IBackground;
    public cursors: AnimatedCursor[];

    /*client-side only*/
    public enterTime: number;

    constructor() {
        this.resetPage();
    }

    public UpdatePage(otherPage: Page) {
        if (otherPage) {
            if (otherPage._id !== this._id) {
                throw 'cannot UpdatePage with a different page. Use LoadPage instead';
            }
            if (otherPage.creator) {
                this.creator = otherPage.creator;
            }
            if (otherPage.permissions) {
                this.permissions = otherPage.permissions;
            }
            if (otherPage.title) {
                this.title = otherPage.title;
            }
            if (otherPage.background) {
                this.background.bType = otherPage.background.bType;
                if (this.background.bType === 'color') {
                    let colorData: ColorBgData = new ColorBgData();
                    colorData.color = (<any> otherPage.background.data).color;
                    this.background.data = colorData;
                } else {
                    this.background.data = {...<any> otherPage.background.data};
                }
            }
            if (otherPage.owners) {
                this.owners = otherPage.owners;
            }
            if (otherPage.elements) {
                for (let e of otherPage.elements) {
                    this.elements.push(e);
                }
            }
            if (otherPage.cursors) {
                for (let c of otherPage.cursors) {
                    this.cursors.push(c);
                }
            }
            this.enterTime = (new Date()).getTime();
        } else {
            throw 'cannot UpdatePage undefined page';
        }
    }

    public LoadPage(otherPage: Page) {
        if (otherPage) {
            if (otherPage._id) {
                this.resetPage();
                this._id = otherPage._id;
                this.UpdatePage(otherPage);
            } else {
                throw 'cannot LoadPage page contains no _id';
            }
        } else {
            throw 'cannot LoadPage page undefined';
        }
    }

    /**
     * Returns a cloned version of this.
     * The cursor and element data is just a pointer to the same data and not a deep copy.
     */
    public Clone(): Page {
        let ret: Page = new Page;

        ret._id = this._id;
        if (this.background.bType === 'color') {
            ret.background.bType = 'color';
            let colorData: ColorBgData = new ColorBgData();
            colorData.color = (<any> this.background.data).color;
            ret.background.data = colorData;
        }
        ret.creator = this.creator;
        ret.owners = this.owners;
        ret.title = this.title;
        ret.permissions = this.permissions;

        ret.cursors = this.cursors;
        ret.elements = this.elements;

        return ret;

    }

    /**
     * Returns a cloned version of this.
     * The cursor and element data is ommitted
     */
    public CloneBasic(): Page {
        let ret: Page = new Page;

        ret._id = this._id;
        if (this.background.bType === 'color') {
            ret.background.bType = 'color';
            let colorData: ColorBgData = new ColorBgData();
            colorData.color = (<any> this.background.data).color;
            ret.background.data = colorData;
        }
        ret.creator = this.creator;
        ret.owners = this.owners;
        ret.title = this.title;
        ret.permissions = this.permissions;
        return ret;
    }

    public GetJSON(): any {
        return {
            id: this._id,
            creator: this.creator,
            owners: this.owners,
            title: this.title,
            permissions: this.permissions,
            background: {
                bType: this.background.bType,
                data: this.background.data.GetJSON()
            }
        };
    }

    public ContainsLinkElementOfName(name: string): boolean {

        for (let i = 0; i < this.elements.length; i++) {
            let element = this.elements[i];
            if (element.eType === 'link' && !element.data.isReturnLink && element.data.text === name) {
                return true;
            }
        }

        return false;
    }

    private resetPage() {
        this._id = '0';
        this.creator = '';
        this.permissions = 'all';
        this.title = 'loading...';
        this.background = {
            bType: 'color',
            data: new ColorBgData()
        };
        this.owners = [];
        this.elements = [];
        this.cursors = [];
        this.enterTime = (new Date()).getTime();
    }

}