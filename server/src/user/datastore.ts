import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

import { User, ActiveUser } from './models';
import { NotFoundError, AlreadyExistsError } from '../common';

export interface DataStore {
    getUser: (userId: User.Id) => Observable<User>;
    insertUser: (user: User) => Observable<User>;

    getActiveUser: (activeUserId: ActiveUser.Id) => Observable<ActiveUser>;
    insertActiveUser: (activeUser: ActiveUser) => Observable<ActiveUser>;

    getActiveUserFromSession: (sessionId: string) => ActiveUser | undefined;
    insertActiveUserFromSession: (sessionId: string, activeUser: ActiveUser) => ActiveUser;
    deleteActiveUserFromSession: (sessionId: string) => void;
}

export class InMemoryDataStore implements DataStore {
    users: Map<User.Id, User>;
    activeUsers: Map<ActiveUser.Id, ActiveUser>;
    activeUserSessions: Map<string, ActiveUser>;

    constructor() {
        this.users = new Map<User.Id, User>();
        this.activeUsers = new Map<ActiveUser.Id, ActiveUser>();
        this.activeUserSessions = new Map<string, ActiveUser>();
    }

    getUser(userId: User.Id) {
        let user = this.users.get(userId);
        if (!user) {
            throw new NotFoundError(`User '${userId}' not found`);
        }

        return Observable.of(user);
    }

    insertUser(user: User) {
        if (this.users.has(user.id)) {
            throw new AlreadyExistsError(`User with id '${user.id}' already exists`);
        }

        this.users.set(user.id, user);
        return Observable.of(user);
    }

    getActiveUser(activeUserId: ActiveUser.Id) {
        let activeUser = this.activeUsers.get(activeUserId);
        if (!activeUser) {
            throw new NotFoundError(`ActiveUser '${activeUserId}' not found`);
        }

        return Observable.of(activeUser);
    }

    insertActiveUser(activeUser: ActiveUser) {
        if (this.activeUsers.has(activeUser.id)) {
            throw new AlreadyExistsError(`ActiveUser with id '${activeUser.id}' already exists`);
        }

        this.activeUsers.set(activeUser.id, activeUser);
        return Observable.of(activeUser);
    }

    getActiveUserFromSession(sessionId: string) {
        return this.activeUserSessions.get(sessionId);
    }

    insertActiveUserFromSession(sessionId: string, activeUser: ActiveUser) {
        if (this.activeUserSessions.has(sessionId)) {
            throw new AlreadyExistsError(`Session '${sessionId}' already has an ActiveUser`);
        }

        this.activeUsers.set(sessionId, activeUser);
        return activeUser;
    }

    deleteActiveUserFromSession(sessionId: string) {
        this.activeUserSessions.delete(sessionId);
    }
}
