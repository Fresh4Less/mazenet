/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../typings/index.d.ts" />

import IBackgroundData = require("./interfaces/IBackgroundData");

export = ColorBgData;

class ColorBgData implements IBackgroundData {
    private _color:string;

    public get color():string {
        return this._color;
    }

    /* Will not set it if not valid hex */
    public set color(col:string) {
        var isHex  = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(col);

        if(isHex) {
            /* Turn 3 digit hexes to 6 digit hexes e.g. #123 to #112233 */
            if(col.length == 4) {
                this._color = '#' + col[1] + col[1] + col[2] + col[2] + col[3] + col[3];
            } else {
                this._color = col;
            }
        }
    }

    constructor() {
        this.color = '#dddddd';
    }

    public GetOppositeColorHex():string {
        /* 16777215 is the int value of #ffffff */
        return '#' + (16777215 - parseInt(this._color.substring(1), 16)).toString(16);
    }
    /* Returns the same as GetOppositeColorHex.
     * Except it accounts for the dastardly rgb(127,127,127) case and returns something darker. */
    public GetHighContrastHex():string {

        var oppositeCol = this.GetOppositeColorHex()
        var tol = 20;
        var red = parseInt(oppositeCol.substring(1,3), 16);
        var green = parseInt(oppositeCol.substring(3,5), 16);
        var blue = parseInt(oppositeCol.substring(5), 16);

        if((red > 127-tol && red < 127+tol)
            && (green > 127-tol && green < 127+tol)
            && (blue > 127-tol && blue < 127+tol)) {
            return '#434343'; //Dark Gray
        }

        return oppositeCol;
    }

    public GetJSON():any {
        return {
          color: this._color
        };
    }
}