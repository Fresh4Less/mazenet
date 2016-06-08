/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../typings/index.d.ts" />

import IBackground = require("../interfaces/IBackground");

export = PageStyles;

class PageStyles {
    public background:IBackground;
    public stringified:string;
    public canvasStringified:string;
    constructor() {
        this.background = {
            bType : 'color',
            data : {
                color : '#333333'
            }
        };
        this.stringified = '';
        this.canvasStringified = 'background : #333333';
    }
}