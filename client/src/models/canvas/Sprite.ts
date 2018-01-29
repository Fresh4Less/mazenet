/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */

export class Sprite {
    public width:number;
    public height:number;
    public image:HTMLImageElement;

    public Render = function(context: CanvasRenderingContext2D, x : number, y : number) {
        context.drawImage(
            this.image,
            0,
            0,
            this.width,
            this.height,
            x,
            y,
            this.width,
            this.height
        );
    };

    constructor(w: number, h: number, img:HTMLImageElement) {
        this.width = w;
        this.height = h;
        this.image = img;
    }
}