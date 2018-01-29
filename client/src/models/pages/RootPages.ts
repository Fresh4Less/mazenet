/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */

export class RootPages {
    public root:string;
    public homepage:string;
    public url:string;

    constructor(root: string, homepage?:string, url?:string) {
        this.root = root;
        this.homepage = homepage ? homepage : '';
        this.url = url ? url : '';
    }
}