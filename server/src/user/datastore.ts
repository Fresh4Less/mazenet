import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

import { User, ActiveUser } from './models';
import { NotFoundError, AlreadyExistsError } from '../common';

export interface DataStore {
    getUser: (userId: User.Id) => Observable<User>;
    insertUser: (user: User) => Observable<User>;

    getActiveUser: (activeUserId: ActiveUser.Id) => Observable<ActiveUser>;
    insertActiveUser: (activeUser: ActiveUser) => Observable<ActiveUser>;

    /** local store, return immediately **/
    getActiveUserFromSession: (sessionId: string) => ActiveUser | undefined;
    insertActiveUserFromSession: (sessionId: string, activeUser: ActiveUser) => ActiveUser;
    deleteActiveUserFromSession: (sessionId: string) => void;
    getSessionFromActiveUser: (activeUserId: ActiveUser.Id) => string | undefined;
}

export class InMemoryDataStore implements DataStore {
    users: Map<User.Id, User>;
    activeUsers: Map<ActiveUser.Id, ActiveUser>;
    sessionActiveUsers: Map<string, ActiveUser>;
    activeUserSessions: Map<ActiveUser.Id, string>;

    constructor() {
        this.users = new Map<User.Id, User>();
        this.activeUsers = new Map<ActiveUser.Id, ActiveUser>();
        this.sessionActiveUsers = new Map<string, ActiveUser>();
        this.activeUserSessions = new Map<ActiveUser.Id, string>();
    }

    getUser(userId: User.Id) {
        let user = this.users.get(userId);
        if (!user) {
            return <Observable<User>>Observable.throw(new NotFoundError(`User '${userId}' not found`));
        }

        return Observable.of(user);
    }

    insertUser(user: User) {
        if (this.users.has(user.id)) {
            return <Observable<User>>Observable.throw(new AlreadyExistsError(`User with id '${user.id}' already exists`));
        }

        this.users.set(user.id, user);
        return Observable.of(user);
    }

    getActiveUser(activeUserId: ActiveUser.Id) {
        let activeUser = this.activeUsers.get(activeUserId);
        if (!activeUser) {
            return <Observable<ActiveUser>>Observable.throw(new NotFoundError(`ActiveUser '${activeUserId}' not found`));
        }

        return Observable.of(activeUser);
    }

    insertActiveUser(activeUser: ActiveUser) {
        if (this.activeUsers.has(activeUser.id)) {
            return <Observable<ActiveUser>>Observable.throw(new AlreadyExistsError(`ActiveUser with id '${activeUser.id}' already exists`));
        }

        this.activeUsers.set(activeUser.id, activeUser);
        return Observable.of(activeUser);
    }

    getActiveUserFromSession(sessionId: string) {
        return this.sessionActiveUsers.get(sessionId);
    }

    insertActiveUserFromSession(sessionId: string, activeUser: ActiveUser) {
        if (this.sessionActiveUsers.has(sessionId)) {
            throw new AlreadyExistsError(`Session '${sessionId}' already has an ActiveUser`);
        }

        this.sessionActiveUsers.set(sessionId, activeUser);
        this.activeUserSessions.set(activeUser.id, sessionId);
        return activeUser;
    }

    deleteActiveUserFromSession(sessionId: string) {
        let activeUser = this.sessionActiveUsers.get(sessionId);
        if(activeUser) {
            this.activeUserSessions.delete(activeUser.id);
        }
        this.sessionActiveUsers.delete(sessionId);
    }

    getSessionFromActiveUser(activeUserId: ActiveUser.Id) {
        return this.activeUserSessions.get(activeUserId);
    }
}
