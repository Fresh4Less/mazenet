/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../typings/index.d.ts" />

import IBackground = require("interfaces/IBackground");
import ColorBgData = require("./ColorBgData");

export = PageStyles;

class PageStyles {
    public background:IBackground;
    public stringified:string;
    public canvasStringified:string;

    constructor() {
        this.background = {
            bType : 'color',
            data : new ColorBgData()
        };

        this.SetStringifications();
    }

    public SetStringifications():void {
        this.stringified = '';

        if(this.background.bType === 'color') {
            this.canvasStringified = 'background : ' + (<ColorBgData>this.background.data).color;
        }
    }
}