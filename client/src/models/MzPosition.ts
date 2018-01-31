/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */

export class MzPosition {
    x: number;
    y: number;

    constructor(x?: number, y?: number) {
        if (x) {
            this.x = x;
        }
        else {
            this.x = 0;
        }
        if (y) {
            this.y = y;
        } else {
            this.y = 0;
        }
    }

    public static IsZero(pos: MzPosition): boolean {
        return pos.x == 0 && pos.y == 0;
    }

    public static IsEdged(pos: MzPosition): boolean {
        return (pos.x == 0 || pos.x == 1) || (pos.y == 0 || pos.y == 1);
    }
}