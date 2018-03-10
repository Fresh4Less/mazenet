import { Client, QueryResult } from 'pg';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/observable/of';
import 'rxjs/add/operator/catch';

import { AlreadyExistsError, NotFoundError } from '../../common';
import { handlePostgresError } from '../../util/postgres';
import { ActiveUser, User } from '../models';
import { DataStore } from './index';

export class PostgresDataStore implements DataStore {

    public client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    public getUser(userId: User.Id) {
        const query =
            `SELECT * FROM users WHERE userid=$1;`;
        return Observable.fromPromise(this.client.query(
            query,
            [userId]
        )).map((result: QueryResult) => {
            if(result.rows.length === 0) {
                throw new NotFoundError(`User '${userId}' not found`);
            }
            return new User({
                id: result.rows[0].userid,
                username: result.rows[0].username
            });
        }).catch(handlePostgresError<User>('getUser', query));
    }

    public insertUser(user: User) {
        const query =
            `INSERT INTO users(userid, username) VALUES ($1, $2) RETURNING *;`;
        return Observable.fromPromise(this.client.query(
            query,
            [user.id, user.username]
        )).map((result: QueryResult) => {
            return new User({
                id: result.rows[0].userid,
                username: result.rows[0].username
            });
        }).catch((err: Error) => {
            //TODO: match error, move this logic to a utility function
            if(err.message === 'must be UNIQUE') {
                return Observable.throw(new AlreadyExistsError(`User with id '${user.id}' already exists`)) as Observable<User>;
            }
            return Observable.throw(err) as Observable<User>;
        }).catch(handlePostgresError<User>('insertUser', query));
    }

    public getActiveUser(activeUserId: ActiveUser.Id) {
        // TODO: hook up to platformdata
        const query =
        `SELECT users.userid, users.username, activeusers.activeuserid, activeusers.pType
        FROM users, activeusers
        WHERE users.userid=activeusers.userid AND activeusers.activeuserid=$1;`;
        return Observable.fromPromise(this.client.query(
            query,
            [activeUserId]
        )).map((result: QueryResult) => {
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
        }).catch(handlePostgresError<ActiveUser>('getUser', query));
    }

    public insertActiveUser(activeUser: ActiveUser) {
        // TODO: hook up to platformdata
        const query =
        `INSERT INTO activeusers(activeuserid, userid, ptype) VALUES ($1, $2, $3) RETURNING *;`;
        return Observable.fromPromise(this.client.query(
            query,
            [activeUser.id, activeUser.userId, activeUser.platformData.pType]
        )).map((result: QueryResult) => {
            // TODO: should this return the value from the databse?
            return activeUser;
        }).catch((err: Error) => {
            //TODO: match error, move this logic to a utility function
            if(err.message === 'must be UNIQUE') {
                return Observable.throw(new AlreadyExistsError(`ActiveUser with id '${activeUser.id}' already exists`)) as Observable<ActiveUser>;
            }
            return Observable.throw(err) as Observable<ActiveUser>;
        }).catch(handlePostgresError<ActiveUser>('insertUser', query));
    }

}
