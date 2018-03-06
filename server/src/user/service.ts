import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/mergeMap';
import { Observable } from 'rxjs/Observable';

import * as Uuid from 'uuid/v4';

import * as Api from '../../../common/api';

import { GlobalLogger } from '../util/logger';

import { DataStore, SessionDataStore } from './datastore';
import { ActiveUser, User } from './models';

export class Service {
    public dataStore: DataStore;
    public sessionDataStore: SessionDataStore;

    constructor(dataStore: DataStore, sessionDataStore: SessionDataStore) {
        this.dataStore = dataStore;
        this.sessionDataStore = sessionDataStore;
    }

    public createUser(userBlueprint: Api.v1.Routes.Users.Create.Post.Request): Observable<User> {
        const newUser = new User({
            id: Uuid(),
            username: userBlueprint.username
        });

        return this.dataStore.insertUser(newUser).map((user) => {
            GlobalLogger.trace('create user', {user});
            return user;
        });
    }

    public createActiveUser(sessionId: string, user: Api.v1.Models.User, platformData: Api.v1.Models.PlatformData): Observable<ActiveUser> {
        const newActiveUser = new ActiveUser({
            id: Uuid(),
            platformData,
            userId: user.id,
            username: user.username,
        });

        return this.dataStore.insertActiveUser(newActiveUser)
            .map((activeUser: ActiveUser) => {
                GlobalLogger.trace('create active user', {activeUser});
                return this.sessionDataStore.insertActiveUserFromSession(sessionId, activeUser);
            });
    }

    public getActiveUserFromSession(sessionId: string): ActiveUser | undefined {
        return this.sessionDataStore.getActiveUserFromSession(sessionId);
    }

    public getSessionFromActiveUser(activeUserId: ActiveUser.Id): string | undefined {
        return this.sessionDataStore.getSessionFromActiveUser(activeUserId);
    }

    public onUserDisconnect(sessionId: string): void {
        this.sessionDataStore.deleteActiveUserFromSession(sessionId);
    }
}
