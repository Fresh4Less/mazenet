import * as Express from 'express';
import { Observable } from 'rxjs';
import * as SocketIO from 'socket.io';

import FreshSocketIO = require('fresh-socketio-router');
import * as Validator from 'fresh-validation';
import { HttpErrors, Request, Response } from '../common';
import { GlobalLogger } from './logger';

import * as Api from '../../../common/api';

/** Catches all errors and responds with correct http code */
export class ErrorHandler {
    constructor() {
        Object.bind(this, this.middleware);
    }

    public middleware(err: any, req: Request, res: Response, next: Express.NextFunction) {
        const errorOut = {
            code: err.httpCode || 500,
            data: Object.keys(err).reduce((o: any, p: string) => {
                o[p] = err[p];
                return o;
            }, {}),
            message: err.message,
        };

        if(errorOut.code >= 500) {
            GlobalLogger.error(`Unhandled ${err.constructor.name} in request handler'`, {error: err});
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
 * - connectionDuration - if socket was closed unexpectedly, duration of the conneciton.
 *                        if this is set, responseXXX fields are undefined
 */
export class RequestLogger {
    constructor() {
        Object.bind(this, this.middleware);
    }

    public middleware(req: Request, res: any, next: Express.NextFunction) {
        const startTime = new Date().valueOf();

        const data = {
            ip: (req as any).ip,
            method: req.method,
            transport: (req.socket as SocketIO.Socket).id ? 'ws' : 'http',
            url: req.originalUrl || req.url,
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
                responseLength
            }));
        });
        next();
    }
}
