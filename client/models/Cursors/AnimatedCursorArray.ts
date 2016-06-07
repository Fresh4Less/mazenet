/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../typings/index.d.ts" />
export = AnimatedCursorArrayDummy;
//TODO Figure out how to extend Array to add cursor shit.
class AnimatedCursorArrayDummy {
    constructor() {
        Array.apply(this, arguments);
        return new Array();
    }
    // we need this, or TS will show an error,
    //XArray["prototype"] = new Array(); will replace with native js arrray function
    //pop(): any { return "" };
    //push(val): number { return 0; };
    //length: number;
}