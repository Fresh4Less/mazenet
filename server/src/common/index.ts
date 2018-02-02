import * as Express from 'express';
import FreshSocketIO = require('fresh-socketio-router');

import { User, ActiveUser } from '../user/models';

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

export class UnauthorizedError extends Error {
    static httpCode = 401;

    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, UnauthorizedError.prototype);
    }
}

export class ForbiddenError extends Error {
    static httpCode = 403;

    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, ForbiddenError.prototype);
    }
}

export class NotFoundError extends Error {
    static httpCode = 404;

    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}

export class ConflictError extends Error {
    static httpCode = 409;

    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, ConflictError.prototype);
    }
}

export let HttpErrors = [BadRequestError, UnauthorizedError, ForbiddenError, NotFoundError, ConflictError];

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

interface MazenetSocketData {
    sessionId: string;
    user: User;
    activeUser?: ActiveUser;
}
interface MazenetSocket {
    mazenet?: MazenetSocketData;
}
export type Socket = SocketIO.Socket & MazenetSocket;

//TODO: use this instead of checking in each route handler. come up with a better name
/** Method Decorator for middlewares that throws an error if the user is not authenticated */
/*
export function authenticated(target: any, propertyKey: string, descriptor: any) {
	let originalMethod = descriptor.value;
	descriptor.value = function(...args: any[]) {
		if(!args[0].user) {
			return args[2](new UnauthorizedError('User must be authenticated'));
		}
		return originalMethod.apply(this, args);
	};

	return descriptor;
}
*/
