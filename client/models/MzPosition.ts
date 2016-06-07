/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../typings/index.d.ts" />

export = MzPosition;

class MzPosition {
    x:number;
    y:number;

    public static IsZero(pos:MzPosition):boolean {
        return pos.x == 0 && pos.y == 0;
    }
    public static IsEdged(pos:MzPosition):boolean {
        return (pos.x == 0 || pos.x == 1) || (pos.y == 0 || pos.y == 1)
    }
}