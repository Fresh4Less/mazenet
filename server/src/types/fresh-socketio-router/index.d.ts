//import * as Express from 'express'; // router doesn't have its own type definitions
//import * as SocketIO from 'socket.io';

///<reference types="node" />
///<reference types="express" />
///<reference types="socket.io" />

declare module 'fresh-socketio-router' {
	var freshSocketIO: FreshSocketIOStatic;
	export = freshSocketIO;
}

interface FreshSocketIOStatic {
	/**
	 * Default middleware constructor
	 */
	(router: FreshSocketIO.Router, options?: FreshSocketIO.Options): (socket: SocketIO.Socket, fn: (err?: any) => void) => void;
	Router: FreshSocketIO.Router;
}

//export = FreshSocketIO

//declare function FreshSocketIO(router: Express.Router, options?: FreshSocketIO.Options): (socket: SocketIO.Socket, fn: (err?: any) => void) => void;

declare namespace FreshSocketIO {
	interface Options {
		/** List of router patterns to ignore. They won't send a 404 response when invoked. */
		ignoreList?: string[];
		/** Won't output to stdout if true */
		silent?: boolean;
	}

	class Request {
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

	class Response {
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

	/** I couldn't figure out how to import the Express router type, so this is what you get. typecast the return value to Express.Router */
	type Router = (options?: RouterOptions) => any;
    interface RouterOptions {
        caseSensitive?: boolean;
        mergeParams?: boolean;
        strict?: boolean;
    }

}
