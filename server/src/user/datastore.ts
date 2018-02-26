import 'rxjs/add/observable/of';
import { Observable } from 'rxjs/Observable';

import { AlreadyExistsError, NotFoundError } from '../common';
import { ActiveUser, User } from './models';

export interface DataStore {
    getUser: (userId: User.Id) => Observable<User>;
    insertUser: (user: User) => Observable<User>;

    getActiveUser: (activeUserId: ActiveUser.Id) => Observable<ActiveUser>;
    insertActiveUser: (activeUser: ActiveUser) => Observable<ActiveUser>;

    /** local store, return immediately */
    getActiveUserFromSession: (sessionId: string) => ActiveUser | undefined;
    insertActiveUserFromSession: (sessionId: string, activeUser: ActiveUser) => ActiveUser;
    deleteActiveUserFromSession: (sessionId: string) => void;
    getSessionFromActiveUser: (activeUserId: ActiveUser.Id) => string | undefined;
}

export class InMemoryDataStore implements DataStore {
    public users: Map<User.Id, User>;
    public activeUsers: Map<ActiveUser.Id, ActiveUser>;
    public sessionActiveUsers: Map<string, ActiveUser>;
    public activeUserSessions: Map<ActiveUser.Id, string>;

    constructor() {
        this.users = new Map<User.Id, User>();
        this.activeUsers = new Map<ActiveUser.Id, ActiveUser>();
        this.sessionActiveUsers = new Map<string, ActiveUser>();
        this.activeUserSessions = new Map<ActiveUser.Id, string>();
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

    public getActiveUserFromSession(sessionId: string) {
        return this.sessionActiveUsers.get(sessionId);
    }

    public insertActiveUserFromSession(sessionId: string, activeUser: ActiveUser) {
        if(this.sessionActiveUsers.has(sessionId)) {
            throw new AlreadyExistsError(`Session '${sessionId}' already has an ActiveUser`);
        }

        this.sessionActiveUsers.set(sessionId, activeUser);
        this.activeUserSessions.set(activeUser.id, sessionId);
        return activeUser;
    }

    public deleteActiveUserFromSession(sessionId: string) {
        const activeUser = this.sessionActiveUsers.get(sessionId);
        if(activeUser) {
            this.activeUserSessions.delete(activeUser.id);
        }
        this.sessionActiveUsers.delete(sessionId);
    }

    public getSessionFromActiveUser(activeUserId: ActiveUser.Id) {
        return this.activeUserSessions.get(activeUserId);
    }
}
