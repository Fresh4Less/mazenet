/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */

export class WebResponse {
    public status: number;
    public headers: any;
    public body: any;

    constructor() {
        this.status = 200;
        this.headers = {};
        this.body = {};
    }
}