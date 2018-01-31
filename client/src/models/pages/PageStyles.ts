/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */

import { IBackground } from './interfaces/IBackground';
import { ColorBgData } from './ColorBgData';

export class PageStyles {
    public background: IBackground;
    public stringified: string;
    public canvasStringified: string;

    constructor() {
        this.background = {
            bType: 'color',
            data: new ColorBgData()
        };

        this.SetStringifications();
    }

    public SetStringifications(): void {
        this.stringified = '';

        if (this.background.bType === 'color') {
            this.canvasStringified = 'background : ' + (<ColorBgData>this.background.data).color;
        }
    }
}