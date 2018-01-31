/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */

import { IDrawMode } from './interfaces/IDrawMode';

export class RedCircleMode implements IDrawMode {
    public name = 'red circles';
    public mode = 'shape';
    public playback = 'live';
    public cumulative = true;
    public data = {
        shape: 'circle',
        size: 20,
        color: {
            red: 255,
            green: 50,
            blue: 50,
            alpha: 0.1
        }
    };

    constructor() {
    }

}