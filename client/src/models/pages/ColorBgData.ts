/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */

import {IBackgroundData} from "./interfaces/IBackgroundData";

export class ColorBgData implements IBackgroundData {

    private _color: string;
    private _bwYIQContrast: string;

    public get color(): string {
        return this._color;
    }

    /* Will not set it if not valid hex */
    public set color(col: string) {
        let isHex = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(col);

        if (isHex) {
            /* Turn 3 digit hexes to 6 digit hexes e.g. #123 to #112233 */
            let colHex: string;
            if (col.length == 4) {
                colHex = col[1] + col[1] + col[2] + col[2] + col[3] + col[3];
                this._color = '#' + colHex;
            } else {
                colHex = col.substring(1);
                this._color = col;
            }

            this.setBlackOrWhiteFromYIQ(colHex)

        }
    }

    constructor() {
        this.color = '#dddddd';
    }

    public GetHighContrastBWHex(): string {

        return this._bwYIQContrast;

    }

    private setBlackOrWhiteFromYIQ(hexColor: string):void {

        let r = parseInt(hexColor.substr(0, 2), 16);
        let g = parseInt(hexColor.substr(2, 2), 16);
        let b = parseInt(hexColor.substr(4, 2), 16);
        let yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;

        this._bwYIQContrast = (yiq >= 128) ? '#000000' : '#ffffff';
    }

    public GetJSON(): any {
        return {
            color: this._color
        };
    }
}