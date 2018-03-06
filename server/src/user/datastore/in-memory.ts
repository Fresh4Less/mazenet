import 'rxjs/add/observable/of';
import { Observable } from 'rxjs/Observable';

import { AlreadyExistsError, NotFoundError } from '../../common';
import { ActiveUser, User } from '../models';
import { DataStore } from './index';

export class InMemoryDataStore implements DataStore {
    public users: Map<User.Id, User>;
    public activeUsers: Map<ActiveUser.Id, ActiveUser>;

    constructor() {
        this.users = new Map<User.Id, User>();
        this.activeUsers = new Map<ActiveUser.Id, ActiveUser>();
    }

    public getUser(userId: User.Id) {
        const user = this.users.get(userId);
        if(!user) {
            return Observable.throw(new NotFoundError(`User '${userId}' not found`)) as Observable<User>;
        }

        return Observable.of(user);
    }

    public insertUser(user: User) {
        if(this.users.has(user.id)) {
            return Observable.throw(new AlreadyExistsError(`User with id '${user.id}' already exists`)) as Observable<User>;
        }

        this.users.set(user.id, user);
        return Observable.of(user);
    }

    public getActiveUser(activeUserId: ActiveUser.Id) {
        const activeUser = this.activeUsers.get(activeUserId);
        if(!activeUser) {
            return Observable.throw(new NotFoundError(`ActiveUser '${activeUserId}' not found`)) as Observable<ActiveUser>;
        }

        return Observable.of(activeUser);
    }

    public insertActiveUser(activeUser: ActiveUser) {
        if(this.activeUsers.has(activeUser.id)) {
            return Observable.throw(new AlreadyExistsError(`ActiveUser with id '${activeUser.id}' already exists`)) as Observable<ActiveUser>;
        }

        this.activeUsers.set(activeUser.id, activeUser);
        return Observable.of(activeUser);
    }
}
