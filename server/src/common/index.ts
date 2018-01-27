export interface Position {
	x: number;
	y: number;
}

export class BadRequestError extends Error {
	constructor(message: string) {
		super(message);
		Object.setPrototypeOf(this, BadRequestError.prototype);
	}
}

export class NotFoundError extends Error {
	constructor(message: string) {
		super(message);
		Object.setPrototypeOf(this, NotFoundError.prototype);
	}
}
