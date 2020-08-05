import { of, Observable, throwError } from 'rxjs';

import { AlreadyExistsError, NotFoundError } from '../../common';
import { ActiveUser, User } from '../models';
import { DataStore, FullProfile } from './index';

export class InMemoryDataStore implements DataStore {
    private users: Map<User.Id, User>;
    private activeUsers: Map<ActiveUser.Id, ActiveUser>;
    private profiles: Map<User.Id, Map<string, FullProfile>>; // userId -> provider -> FullProfile
    private profilesProviderIndex: Map<string, Map<string,FullProfile>>; // provider -> profileId -> FullProfile

    private rootUserId?: User.Id;

    constructor() {
        this.users = new Map<User.Id, User>();
        this.activeUsers = new Map<ActiveUser.Id, ActiveUser>();
        this.profiles = new Map();
        this.profilesProviderIndex = new Map();
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

    public getProfile(provider: string, id: string) {
        const providers = this.profilesProviderIndex.get(provider);
        if(!providers) {
            return throwError(new NotFoundError(`Profile provider '${provider}' not found`));
        }

        const profile = providers.get(id);
        if(!profile) {
            return throwError(new NotFoundError(`Profile id '${id}' not found for provider '${provider}'`));
        }

        return of(profile);
    }

    public getProfiles(userId: User.Id) {
        const profiles = this.profiles.get(userId);
        if(!profiles) {
            return of([] as FullProfile[]);
        }

        return of(Array.from(profiles.values()));
    }

    public insertProfile(userId: User.Id, profile: User.Profile, secret: string) {
        if(!this.users.has(userId)) {
            return throwError(new NotFoundError(`User with id '${userId}' not found`));
        }

        let profiles = this.profiles.get(userId);
        if(!profiles) {
            profiles = new Map();
            this.profiles.set(userId, profiles);
        }

        if(profiles.has(profile.provider)) {
            return throwError(new AlreadyExistsError(`Profile provider '${profile.provider}' already exists for user '${userId}' (profile id: '${profiles.get(profile.provider)!.profile.id}'`));
        }

        let providersIndex = this.profilesProviderIndex.get(profile.provider);
        if(!providersIndex) {
            providersIndex = new Map();
            this.profilesProviderIndex.set(profile.provider, providersIndex);
        }

        if(providersIndex.has(profile.id)) {
            return throwError(new AlreadyExistsError(`Profile id '${profile.id}' already exists for profile provider '${profile.provider}'`));
        }

        const fullProfile = {
            userId,
            profile,
            secret
        };

        profiles.set(profile.provider, fullProfile);
        providersIndex.set(profile.id, fullProfile);

        return of(fullProfile);
    }
}
