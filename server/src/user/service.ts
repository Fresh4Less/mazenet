import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/operator/mergeMap';

import * as Uuid from 'uuid/v4';

import * as Api from '../../../common/api';

import { GlobalLogger } from '../util/logger';

import { DataStore } from './datastore';
import { User, ActiveUser } from './models';

export class Service {
    dataStore: DataStore;

    constructor(dataStore: DataStore) {
        this.dataStore = dataStore;
    }

    createUser(userBlueprint: Api.v1.Routes.Users.Create.Post.Request): Observable<User> {
        let user = new User({
            id: Uuid(),
            username: userBlueprint.username
        });

        return this.dataStore.insertUser(user).map((user) => {
            GlobalLogger.trace('create user', {user});
            return user;
        });
    }

    createActiveUser(sessionId: string, user: Api.v1.Models.User, platformData: Api.v1.Models.PlatformData): Observable<ActiveUser>{
        let activeUser = new ActiveUser({
            id: Uuid(),
            userId: user.id,
            username: user.username,
            platformData: platformData
        });

        return this.dataStore.insertActiveUser(activeUser)
            .map((activeUser: ActiveUser) => {
                GlobalLogger.trace('create active user', {activeUser});
                return this.dataStore.insertActiveUserFromSession(sessionId, activeUser);
            });
    }

    getActiveUserFromSession(sessionId: string): ActiveUser | undefined {
        return this.dataStore.getActiveUserFromSession(sessionId);
    }

    onUserDisconnect(sessionId: string): void {
        this.dataStore.deleteActiveUserFromSession(sessionId);
    }
}
