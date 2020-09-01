import { ReplaySubject, Subject } from "rxjs";
const cursorIcon = require('../media/cursor.png');

// TODO load in the cursor sprite and have an observable that says when all media is loaded in.
export default class MediaPreloader{

    private static _instance: MediaPreloader
    public static get Instance(): MediaPreloader {
        return this._instance || (this._instance = new this());
    }

    // Returns true and 
    readonly Loaded: Subject<[boolean, Error]>;

    /* pieces of media to preload */
    readonly CursorSprite: HTMLImageElement;

    private constructor() {

        this.CursorSprite = document.createElement('img');
        this.CursorSprite.src = cursorIcon;

        this.Loaded = this.setupLoadObservable([
            this.CursorSprite
        ])
    }

    private setupLoadObservable(elements: HTMLElement[]): Subject<[boolean, Error]> {
        let loaded = 0;
        const count = elements.length;

        let o = new ReplaySubject<[boolean, Error]>();

        for(let e of elements) {
            e.onload = ()=> {
                loaded++;
                if (loaded >= count) {
                    o.next([true, new Error()]);
                }
            };
            e.onerror = (event)=> {
                loaded++;
                if (loaded >= count) {
                    o.next([false, new Error(event.toString())]);
                }
            };

        }
        return o
    }



}