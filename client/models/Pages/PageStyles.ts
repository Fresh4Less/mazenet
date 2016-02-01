/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../typings/tsd.d.ts" />

import IBackground = require("../Interfaces/IBackground");

export = PageStyles;

class PageStyles {
    public background:IBackground;
    public stringified:string;
    public canvasStringified:string;
    constructor() {
        this.background = {
            bType : 'color',
            data : {
                color : '#000000'
            }
        };
        this.stringified = '';
        this.canvasStringified = 'background : #000000';
    }
}