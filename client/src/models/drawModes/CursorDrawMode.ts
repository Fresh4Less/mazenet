/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */

import { IDrawMode } from './interfaces/IDrawMode';

export class CursorDrawMode implements IDrawMode {
    public name:string = 'live cursors';
    public mode:string =  'sprite';
    public playback:string = 'live';
    public cumulative:boolean = false;
    public data:any = {
        ready: false,
        sprite: new Image(),
        width: 12,
        height: 21,
    };
    constructor() {
        let self = this;
        this.data.sprite.src = "images/cursors/cursor.png";
        this.data.sprite.onload = function() {
            self.data.ready = true;
        };
    }

}