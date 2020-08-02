import { Pool, QueryResult } from 'pg';
import { from, of, Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';


import { AlreadyExistsError, NotFoundError } from '../../common';
import { handlePostgresError } from '../../util/postgres';
import { Record } from '../../util/telemetry';
import { ActiveUser, User } from '../models';
import { DataStore } from './index';

export class PostgresDataStore implements DataStore {

    public clientPool: Pool;

    constructor(clientPool: Pool) {
        this.clientPool = clientPool;
    }

    @Record()
    public getUser(userId: User.Id) {
        const query =
            `SELECT * FROM users WHERE userid=$1;`;
        return from(this.clientPool.query(
            query,
            [userId]
        )).pipe(
            map((result: QueryResult) => {
                if(result.rows.length === 0) {
                    throw new NotFoundError(`User '${userId}' not found`);
                }
                return new User({
                    id: result.rows[0].userid,
                    username: result.rows[0].username
                });
            }),
            catchError(handlePostgresError<User>('getUser', query))
        );
    }

    @Record()
    public insertUser(user: User) {
        const query =
            `INSERT INTO users(userid, username) VALUES ($1, $2) RETURNING *;`;
        return from(this.clientPool.query(
            query,
            [user.id, user.username]
        )).pipe(
            map((result: QueryResult) => {
                return new User({
                    id: result.rows[0].userid,
                    username: result.rows[0].username
                });
            }),
            catchError((err: Error) => {
                //TODO: match error, move this logic to a utility function
                if(err.message === 'must be UNIQUE') {
                    return throwError(new AlreadyExistsError(`User with id '${user.id}' already exists`)) as Observable<User>;
                }
                return throwError(err) as Observable<User>;
            }),
            catchError(handlePostgresError<User>('insertUser', query))
        );
    }

    @Record()
    public getActiveUser(activeUserId: ActiveUser.Id) {
        // TODO: hook up to platformdata
        const query =
            `SELECT users.userid, users.username, activeusers.activeuserid, activeusers.pType
        FROM users, activeusers
        WHERE users.userid=activeusers.userid AND activeusers.activeuserid=$1;`;
        return from(this.clientPool.query(
            query,
            [activeUserId]
        )).pipe(
            map((result: QueryResult) => {
                if(result.rows.length === 0) {
                    throw new NotFoundError(`ActiveUser '${activeUserId}' not found`);
                }
                let platformData: ActiveUser.PlatformData;
                switch(result.rows[0].ptype) {
                    case 'desktop':
                        platformData = {
                            cursorPos: { x: 0, y: 0 },
                            pType: 'desktop',
                        };
                        break;
                    case 'mobile':
                        platformData = {
                            pType: 'mobile',
                        };
                        break;
                    default:
                        throw new Error(`Invalid platformData type ${result.rows[0].ptype}`);
                }
                return new ActiveUser({
                    id: result.rows[0].activeuserid,
                    platformData,
                    userId: result.rows[0].userid,
                    username: result.rows[0].username,
                });
            }),
            catchError(handlePostgresError<ActiveUser>('getUser', query))
        );
    }

    @Record()
    public insertActiveUser(activeUser: ActiveUser) {
        // TODO: hook up to platformdata
        const query =
            `INSERT INTO activeusers(activeuserid, userid, ptype) VALUES ($1, $2, $3) RETURNING *;`;
        return from(this.clientPool.query(
            query,
            [activeUser.id, activeUser.userId, activeUser.platformData.pType]
        )).pipe(
            map((result: QueryResult) => {
                // TODO: return the value from the databse
                return activeUser;
            }),
            catchError((err: Error) => {
                //TODO: match error, move this logic to a utility function
                if(err.message === 'must be UNIQUE') {
                    return throwError(new AlreadyExistsError(`ActiveUser with id '${activeUser.id}' already exists`)) as Observable<ActiveUser>;
                }
                return throwError(err) as Observable<ActiveUser>;
            }),
            catchError(handlePostgresError<ActiveUser>('insertUser', query))
        );
    }

    @Record()
    public getRootUserId() {
        const query =
            `SELECT * from rootuser;`;

        return from(this.clientPool.query(query)
        ).pipe(
            map((result: QueryResult) => {
                if(result.rows.length === 0) {
                    throw new NotFoundError(`Root user id not set`);
                }
                return result.rows[0].rootuserid;
            }),
            catchError(handlePostgresError<User.Id>('getRootUserId', query))
        );
    }

    @Record()
    public setRootUserId(userId: User.Id) {
        // NOTE: overwriting the root user id if it is already set probably shouldn't be allowed
        const query =
            `INSERT INTO rootuser (rowid, rootuserid) VALUES (TRUE, $1)
            ON CONFLICT (rowid) DO UPDATE SET rootuserid = EXCLUDED.rootuserid;`;

        return from(this.clientPool.query(
            query,
            [userId]
        )).pipe(
            map((result: QueryResult) => {
                return null;
            }),
            catchError(handlePostgresError<null>('setRootUserId', query))
        );
    }

}
