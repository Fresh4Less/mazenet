/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */

import { IDrawMode } from './interfaces/IDrawMode';

export class StaticRedLinesMode implements IDrawMode {
    public name = 'static red lines';
    public mode = 'shape';
    public playback = 'static';
    public cumulative = true;
    public data = {
        shape: 'line',
        size: 1,
        color: {
            red: 255,
            green: 50,
            blue: 50,
            alpha: 0.1
        }
    };
}