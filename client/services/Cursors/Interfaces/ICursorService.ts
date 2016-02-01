/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../../typings/tsd.d.ts" />
import IDrawMode = require("./../../../models/DrawModes/Interfaces/IDrawMode");

export = ICursorService;

interface ICursorService {
    DrawMode:IDrawMode;
    CycleDrawMode();
    OnCycleDrawMode(funct:()=>void);
    UserMovedCursor($event:MouseEvent);
}