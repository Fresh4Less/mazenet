/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../typings/tsd.d.ts" />

import CursorFrame = require("./CursorFrame");

export = AnimatedCursor;

class AnimatedCursor {
    public uId:string;
    public frames:CursorFrame[];
}