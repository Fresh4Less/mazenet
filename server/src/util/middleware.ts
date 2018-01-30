import {Observable} from 'rxjs/Observable';
import * as Express from 'express';

import {GlobalLogger} from './logger';
import * as Validator from './validator';
import FreshSocketIO = require('fresh-socketio-router');
import {Request, Response, BadRequestError, NotFoundError} from '../common';

import * as Api from '../api'

/** Catches all errors and matches them with the appropriate http response code */
export class ErrorHandler {
	/** Universal router that can be used in express or fresh-socketio-router */
	router: Express.Router;

	constructor() {
			this.router = Express.Router();
			this.router.use((err: any, req: Request, res: Response) => {

				//HTTP error types
				let errorType = [BadRequestError, NotFoundError].find((eType) => {
					return err instanceof eType;
				});

				let errorOut = {
					code: errorType ? errorType.httpCode : 500,
					message: err.message,
					data: Object.keys(err).reduce((o:any, p:string) => {
						o[p] = err[p];
						return o;
					}, {})
				};

				if(errorOut.code >= 500) {
					GlobalLogger.error(`Unhandled ${err.prototype.name} in request handler'`, {
						errorType: err.prototype.name,
						message: err.message,
						data: errorOut.data
					});
				}
				res.status(errorOut.code).json(errorOut);
		});
	}
}

/** Logs information about request */
export class RequestLogger {
}
