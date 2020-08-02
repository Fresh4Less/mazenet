import { of, Observable, throwError } from 'rxjs';

import { AlreadyExistsError, NotFoundError } from '../../common';
import { ActiveUser, User } from '../models';
import { DataStore } from './index';

export class InMemoryDataStore implements DataStore {
    private users: Map<User.Id, User>;
    private activeUsers: Map<ActiveUser.Id, ActiveUser>;
    private rootUserId?: User.Id;

    constructor() {
        this.users = new Map<User.Id, User>();
        this.activeUsers = new Map<ActiveUser.Id, ActiveUser>();
    }

    public getUser(userId: User.Id) {
        const user = this.users.get(userId);
        if(!user) {
            return throwError(new NotFoundError(`User '${userId}' not found`)) as Observable<User>;
        }

        return of(user);
    }

    public insertUser(user: User) {
        if(this.users.has(user.id)) {
            return throwError(new AlreadyExistsError(`User with id '${user.id}' already exists`)) as Observable<User>;
        }

        this.users.set(user.id, user);
        return of(user);
    }

    public getActiveUser(activeUserId: ActiveUser.Id) {
        const activeUser = this.activeUsers.get(activeUserId);
        if(!activeUser) {
            return throwError(new NotFoundError(`ActiveUser '${activeUserId}' not found`)) as Observable<ActiveUser>;
        }

        return of(activeUser);
    }

    public insertActiveUser(activeUser: ActiveUser) {
        if(this.activeUsers.has(activeUser.id)) {
            return throwError(new AlreadyExistsError(`ActiveUser with id '${activeUser.id}' already exists`)) as Observable<ActiveUser>;
        }

        this.activeUsers.set(activeUser.id, activeUser);
        return of(activeUser);
    }

    public getRootUserId() {
        if(!this.rootUserId) {
            return throwError(new NotFoundError(`Root user id not set`)) as Observable<User.Id>;
        }

        return of(this.rootUserId);
    }

    public setRootUserId(userId: User.Id) {
        this.rootUserId = userId;
        return of(null);
    }
}
