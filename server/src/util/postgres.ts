import { Client } from 'pg';
import { Observable } from 'rxjs/Observable';

export class PostgresQueryError extends Error {
    public originalError: Error;
    constructor(queryName: string, query: string, err: Error) {
        super(`Postgres query failed [${queryName}]: ${err.message}, ${query}`);
        Object.setPrototypeOf(this, PostgresQueryError.prototype);
        this.originalError = err;
    }
}

export function handlePostgresError<T>(queryName: string, query: string): (err: Error) => Observable<T> {
    return (err: Error) => (Observable.throw(new PostgresQueryError(queryName, query, err)) as Observable<T>);
}
