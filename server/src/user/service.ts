import { forkJoin, of, Observable } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';

import * as Uuid from 'uuid/v4';

import * as Api from '../../../common/api';

import { GlobalLogger } from '../util/logger';

import { NotFoundError } from '../common';
import { DataStore, SessionDataStore } from './datastore';
import { ActiveUser, User } from './models';

export class Service {
    public dataStore: DataStore;
    public sessionDataStore: SessionDataStore;

    constructor(dataStore: DataStore, sessionDataStore: SessionDataStore) {
        this.dataStore = dataStore;
        this.sessionDataStore = sessionDataStore;
    }

    public getUser(userId: User.Id): Observable<User> {
        return this.dataStore.getUser(userId);
    }

    public createUser(userBlueprint: Api.v1.Routes.Users.Create.Post.Request): Observable<User> {
        const newUser = new User({
            id: Uuid(),
            username: userBlueprint.username
        });

        return this.dataStore.insertUser(newUser).pipe(
            map((user) => {
                GlobalLogger.trace('create user', {user});
                return user;
            })
        );
    }

    public getActiveUser(activeUserId: ActiveUser.Id): Observable<ActiveUser> {
        return this.dataStore.getActiveUser(activeUserId);
    }

    public createActiveUser(sessionId: string, user: Api.v1.Models.User, platformData: Api.v1.Models.PlatformData): Observable<ActiveUser> {
        const newActiveUser = new ActiveUser({
            id: Uuid(),
            platformData,
            userId: user.id,
            username: user.username,
        });

        return this.dataStore.insertActiveUser(newActiveUser).pipe(
            map((activeUser: ActiveUser) => {
                GlobalLogger.trace('create active user', {activeUser});
                return this.sessionDataStore.insertActiveUserFromSession(sessionId, activeUser);
            })
        );
    }

    public getActiveUserFromSession(sessionId: string): ActiveUser | undefined {
        return this.sessionDataStore.getActiveUserFromSession(sessionId);
    }

    public getSessionFromActiveUser(activeUserId: ActiveUser.Id): string | undefined {
        return this.sessionDataStore.getSessionFromActiveUser(activeUserId);
    }

    public getRootUser(): Observable<User> {
        return this.dataStore.getRootUserId().pipe(
            catchError((err: Error) => {
                if(err instanceof NotFoundError) {
                    const rootUserBlueprint = {
                        username: 'mazenet'
                    };
                    return this.createUser(rootUserBlueprint).pipe(
                        mergeMap((user) => {
                            return this.dataStore.setRootUserId(user.id).pipe(
                                map(() => {
                                    GlobalLogger.trace('init root user', {user});
                                    return user.id;
                                })
                            );
                        })
                    );
                }

                return Observable.throw(err) as Observable<User.Id>;
            }),
            mergeMap((userId) => {
                return this.getUser(userId);
            })
        );
    }

    public onUserDisconnect(sessionId: string): void {
        this.sessionDataStore.deleteActiveUserFromSession(sessionId);
    }
}
