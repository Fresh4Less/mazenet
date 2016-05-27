/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../typings/tsd.d.ts" />

import SpriteOptions = require("./SpriteOptions");

export = Sprite;

class Sprite {
    public context:CanvasRenderingContext2D
    public width:number;
    public height:number;
    public image:HTMLImageElement;

    public Render = function(x, y) {
        this.context.drawImage(
            this.image,
            0,
            0,
            this.width,
            this.height,
            x,
            y,
            this.width,
            this.height);
    };

    constructor(options:SpriteOptions) {
        this.context = options.context;
        this.width = options.width;
        this.height = options.height;
        this.image = options.image;
    }
}