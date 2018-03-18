import { Pool, PoolClient, QueryResult } from 'pg';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/observable/concat';

import { NotFoundError } from '../common';

export class PostgresQueryError extends Error {
    public query: string;
    public originalError: Error;
    constructor(queryName: string, query: string, err: Error) {
        super(`Postgres query failed [${queryName}]: ${err.message}`);
        Object.setPrototypeOf(this, PostgresQueryError.prototype);
        this.query = query;
        this.originalError = err;
    }
}

export function handlePostgresError<T>(queryName: string, query: string): (err: Error) => Observable<T> {
    // TODO: only match match postgres errors
    return (err: Error) => {
        if(err instanceof NotFoundError) {
            return Observable.throw(err) as Observable<T>;
        }
        return Observable.throw(new PostgresQueryError(queryName, query, err)) as Observable<T>;
    };
}

export interface QueryData {
    query: string;
    params: string[];
}

export function executeTransaction(clientPool: Pool, queries: QueryData[]): Observable<QueryResult[]> {
    return Observable.fromPromise(clientPool.connect()).mergeMap((client: PoolClient) => {
        return Observable.concat(
            Observable.fromPromise(client.query('BEGIN;')),
            ...queries.map((queryData) => Observable.fromPromise(client.query(queryData.query, queryData.params))),
            Observable.fromPromise(client.query('COMMIT;')),
        ).toArray().map((results: QueryResult[]) => {
            client.release();
            // don't return BEGIN and COMMIT query results
            return results.slice(1,-1);
        }).catch((err: Error) => {
            return Observable.fromPromise(client.query(`ROLLBACK;`)).map(() => {
                client.release();
                throw err;
            });
        });
    });
}
