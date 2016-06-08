/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../../typings/index.d.ts" />
import IDrawMode = require("./../../../models/DrawModes/Interfaces/IDrawMode");
import AnimatedCursor = require("../../../models/Cursors/AnimatedCursor");

export = ICursorService;

interface ICursorService {
    DrawMode:IDrawMode;
    CycleDrawMode();
    OnCycleDrawMode(func:()=>void);
    UserMovedCursor($event:MouseEvent);
    FilterCursorData(cursors:AnimatedCursor[]);
}