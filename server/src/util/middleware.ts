import { Observable } from 'rxjs/Observable';
import * as Express from 'express';
import * as SocketIO from 'socket.io';

import { GlobalLogger } from './logger';
import * as Validator from '../../../common/util/validator';
import FreshSocketIO = require('fresh-socketio-router');
import { Request, Response, HttpErrors} from '../common';

import * as Api from '../../../common/api';

/** Catches all errors and responds with correct http code */
export class ErrorHandler {
    constructor() {
        Object.bind(this, this.middleware);
    }

    middleware(err: any, req: Request, res: Response, next: Express.NextFunction) {
        let errorOut = {
            code: err.httpCode || 500,
            message: err.message,
            data: Object.keys(err).reduce((o: any, p: string) => {
                o[p] = err[p];
                return o;
            }, {})
        };

        if (errorOut.code >= 500) {
            GlobalLogger.error(`Unhandled ${err.constructor.name} in request handler'`, err);
        }
        res.status(errorOut.code).json(errorOut);
    }
}

/** Logs information about request
 * - method - http method
 * - url
 * - ip - client ip
 * - transport - http or ws
 * - responseLength - length of response body in bytes
 * - responseCode - http response code
 * - responseDuration - response latency in milliseconds
 * - connectionDuration - if socket was closed unexpectedly, duration of the conneciton. if this is set, responseXXX fields are undefined
 */
export class RequestLogger {
    constructor() {
        Object.bind(this, this.middleware);
    }

    middleware(req: Request, res: any, next: Express.NextFunction) {
        let startTime = new Date().valueOf();

        let data = {
            method: req.method,
            url: req.originalUrl || req.url,
            ip: (<any>req).ip,
            transport: (<SocketIO.Socket>req.socket).id ? 'ws' : 'http',
        };
        res.on('close', () => {
            GlobalLogger.request('closed', Object.assign(data, {
                connectionDuration: new Date().valueOf() - startTime,
            }));
        });
        res.on('finish', () => {
            let responseLength = res.get && res.get('Content-Length');
            if(!responseLength && res.message && typeof res.message === 'object') {
                // assume this is a fresh-socketio-router JSON response and stringify it
                // to figure out the length. currently, socketio doesn't expose the
                // actual sent packet, so this is just a rough approximation, that
                // doesn't account for packet encoding, overhead, and compression
                responseLength = Buffer.byteLength(JSON.stringify(res.message), 'utf8');
            }

            GlobalLogger.request('complete', Object.assign(data, {
                responseCode: res.statusCode,
                responseDuration: new Date().valueOf() - startTime,
                responseLength: responseLength
            }));
        });
        next();
    }
}
