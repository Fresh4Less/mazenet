import { Observable } from 'rxjs/Observable';
import * as Express from 'express';

import { GlobalLogger } from './logger';
import * as Validator from '../../../common/util/validator';
import FreshSocketIO = require('fresh-socketio-router');
import { Request, Response, HttpErrors} from '../common';

import * as Api from '../../../common/api';

/** Catches all errors and matches them with the appropriate http response code */
export class ErrorHandler {
    constructor() {
        Object.bind(this, this.middleware);
    }

    middleware(err: any, req: Request, res: Response, next: Express.NextFunction) {
        //HTTP error types
        let errorType = HttpErrors.find((eType) => {
            return err instanceof eType;
        });

        let errorOut = {
            code: errorType ? errorType.httpCode : 500,
            message: err.message,
            data: Object.keys(err).reduce((o: any, p: string) => {
                o[p] = err[p];
                return o;
            }, {})
        };

        if (errorOut.code >= 500) {
            GlobalLogger.error(`Unhandled ${err.constructor.name} in request handler'`, {
                errorType: err.constructor.name,
                message: err.message,
                stack: err.stack,
                data: errorOut.data
            });
        }
        res.status(errorOut.code).json(errorOut);
    }
}

/** Logs information about request */
export class RequestLogger {
}
