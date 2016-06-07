/* Mazenet - Fresh4Less - Samuel Davidson | Elliot Hatch */
/// <reference path="../../../typings/index.d.ts" />

export = WebRequest;

class WebRequest {

    public method:string;
    public headers:any;
    public body:any;

    private validMethods:string[] = ['GET'];

    constructor(method:string, body:any, requestId:string, additionalHeaders?:any) {

        if(!method || this.validMethods.indexOf(method) < 0) {
            console.error('WebRequest: invalid method', method);
        }

        this.method = method;

        this.body = body;

        if(requestId) {
            this.headers = {
                'X-Fresh-Request-Id': requestId
            };
        } else {
            console.error('WebRequest: missing requestId', requestId);
        }

        if(additionalHeaders) {
            for(var property in additionalHeaders) {
                if(additionalHeaders.hasOwnProperty(property))
                    this.headers[property] = additionalHeaders[property];
            }
        }

    }
}