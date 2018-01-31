import * as Express from 'express'; // router doesn't have its own type definitions
import * as SocketIO from 'socket.io';

export = FreshSocketIO

declare function FreshSocketIO(router: Express.Router, options?: FreshSocketIO.Options): (socket: SocketIO.Socket, fn: (err?: any) => void) => void;

declare namespace FreshSocketIO {
    export type Router = Express.Router;

    export interface Options {
        /* List of router patterns to ignore. They won't send a 404 response when invoked. */
        ignoreList?: string[];
        /* Won't output to stdout if true */
        silent?: boolean;
    }

    export class Request {
        socket: SocketIO.Socket;
        url: string;
        originalUrl: string;
        message: string;
        method: string;
        headers: { [name: string]: string };
        body: any;

        get: (field: string) => string;
        header: (field: string) => string;
    }

    export class Response {
        socket: SocketIO.Socket;
        headers: { [name: string]: string };
        sentResponse: boolean;
        ack: (message: string) => void;
        message: string;
        emitUrl: string;
        statusCode: number;

        set: (field: string, value: string) => void;
        header: (field: string, value: string) => void;

        status: (httpStatusCode: number) => Response;
        send: (body: any) => Response;
        json: (body: any) => Response;
    }
}
