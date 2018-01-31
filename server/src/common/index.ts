import * as Express from 'express';
import FreshSocketIO = require('fresh-socketio-router');

import {User, ActiveUser} from '../user/models';

export interface Position {
	x: number;
	y: number;
}

export class BadRequestError extends Error {
	static httpCode = 400;
	constructor(message: string) {
		super(message);
		Object.setPrototypeOf(this, BadRequestError.prototype);
	}
}

export class NotFoundError extends Error {
	static httpCode = 404;
	constructor(message: string) {
		super(message);
		Object.setPrototypeOf(this, NotFoundError.prototype);
	}
}

export class AlreadyExistsError extends Error {
	constructor(message: string) {
		super(message);
		Object.setPrototypeOf(this, AlreadyExistsError.prototype);
	}
}

interface MazenetRequest {
	user?: User;
	activeUser?: ActiveUser;
}

//export type Request = (Express.Request | FreshSocketIO.Request) & MazenetRequest;
export type Request = (Express.Request | FreshSocketIO.Request) & MazenetRequest;
export type Response = Express.Response | FreshSocketIO.Response;
