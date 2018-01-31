/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */

import { Sprite } from './Sprite';
import { RenderType } from './RenderTypes';

export class RenderConfig {

    public Type: RenderType;
    public XPercent: number;
    public YPercent: number;
    public Sprite: Sprite;
    public ClearFrame: boolean;

    constructor() {
        this.Type = RenderType.None;
        this.ClearFrame = false;
    }

}