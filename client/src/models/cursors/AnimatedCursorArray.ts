/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */

//TODO Figure out how to extend Array to add cursor shit.
export class AnimatedCursorArrayDummy {
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