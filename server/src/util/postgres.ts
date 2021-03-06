import { Pool, PoolClient, QueryResult } from 'pg';
import { from, of, Observable, throwError } from 'rxjs';
import { catchError, expand, map, mergeMap, skip, take, toArray } from 'rxjs/operators';

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
            return throwError(err) as Observable<T>;
        }
        return throwError(new PostgresQueryError(queryName, query, err)) as Observable<T>;
    };
}

export interface QueryData {
    query: string;
    params: any[];
}

export type QueryDataFunc = (result: QueryResult) => QueryData | undefined;

export function executeTransaction(clientPool: Pool, queries: Array<QueryData | QueryDataFunc>): Observable<Array<QueryResult | undefined>> {
    return from(clientPool.connect()).pipe(
        mergeMap((client: PoolClient) => {
            const transactionQueries: Array<QueryData | QueryDataFunc> = [
                {query: 'BEGIN;', params: []},
                ...queries,
                {query: 'COMMIT;', params: []},
            ];
            return of(undefined).pipe(
                expand((result, index) => {
                    let queryData: QueryData | QueryDataFunc | undefined = transactionQueries[index];
                    // query data fields can be function or value
                    if(typeof queryData === 'function') {
                        if(!result) {
                            // function queryData always needs the previous result to work off. If there is none, just skip
                            return of(undefined);
                        }
                        queryData = queryData(result!);
                    }

                    if(!queryData) {
                        return of(undefined);
                    }

                    return from(client.query(queryData.query, queryData.params));
                }),
                skip(1),
                take(transactionQueries.length),
                toArray(),
                map((results) => {
                    client.release();
                    // don't return BEGIN and COMMIT query results
                    return results.slice(1,-1);
                }),
                catchError((err: Error) => {
                    return from(client.query(`ROLLBACK;`)).pipe(
                        map(() => {
                            client.release();
                            throw err;
                        })
                    );
                })
            );
        })
    );
}

/** Build the SET section of an UPDATE query
 * @argument columnData - tuple of [columnName, value]
 * @argument startIndex - starting number for SQL parameters (e.g. 1 => $1)
 */
export function buildQuery_SetColumns(columnData: Array<[string, any]>, startIndex: number): QueryData {
    const params: any[] = [];
    const queries = columnData.filter((data) => data[1] !== undefined)
        .map((data, i) => {
            params.push(data[1]);
            return `${data[0]} = $${i+startIndex}`;
    });

    return {
        params,
        query: 'SET ' + queries.join(', '),
    };
}
