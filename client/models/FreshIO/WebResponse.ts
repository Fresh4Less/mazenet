/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../typings/index.d.ts" />

export = WebResponse;

class WebResponse {
    public status:number;
    public headers:any;
    public body:any;

    constructor() {
        this.status = 200;
        this.headers = {};
        this.body = {};
    }
}