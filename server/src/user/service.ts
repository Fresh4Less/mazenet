import * as bcrypt from 'bcrypt';
import * as JWT from 'jsonwebtoken';
import { bindNodeCallback, from, forkJoin, of, Observable, throwError } from 'rxjs';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';

import * as Uuid from 'uuid/v4';

import * as Api from '../../../common/api';

import { GlobalLogger } from '../util/logger';

import { BadRequestError, NotFoundError, UnauthorizedError, KeyPair } from '../common';
import { DataStore, SessionDataStore } from './datastore';
import { ActiveUser, AuthenticationToken, User, Account } from './models';

const verifyJwt = bindNodeCallback<string, JWT.Secret, JWT.VerifyOptions, AuthenticationToken>(JWT.verify);
const signJwt = bindNodeCallback<object, JWT.Secret, JWT.SignOptions, string>(JWT.sign);

export class Service {
    public dataStore: DataStore;
    public sessionDataStore: SessionDataStore;

    public passwordSaltRounds: number = 12;
    // TODO: load the keys and pass them into here
    private jwtKeys: KeyPair;

    constructor(dataStore: DataStore, sessionDataStore: SessionDataStore, jwtKeys: KeyPair) {
        this.dataStore = dataStore;
        this.sessionDataStore = sessionDataStore;
        this.jwtKeys = jwtKeys;
    }

    public getUser(userId: User.Id): Observable<User> {
        return this.dataStore.getUser(userId);
    }

    public createUser(userBlueprint: User.Blueprint): Observable<User> {
        const newUser = new User({
            id: Uuid(),
            username: userBlueprint.username,
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

    public createActiveUser(sessionId: string, user: User, platformData: Api.v1.Models.PlatformData): Observable<ActiveUser> {
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
                        username: 'mazenet',
                        profiles: [], // TODO: provide a way of signing in as the root user?
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

                return throwError(err) as Observable<User.Id>;
            }),
            mergeMap((userId) => {
                return this.getUser(userId);
            })
        );
    }

    public createAuthenticationToken(userId: User.Id): Observable<string> {
        return signJwt({}, this.jwtKeys.private, {
            algorithm: 'ES256',
            issuer: 'mazenet',
            audience: 'mazenet',
            expiresIn: '1h',
            subject: userId,
        }).pipe(
            tap((authenticationToken) => GlobalLogger.diag('create authenticationToken', {
                userId,
            }))
        );
    }

    public verifyAuthenticationToken(token: string): Observable<AuthenticationToken> {
        return verifyJwt(token, this.jwtKeys.public, {
            algorithms: ['ES256'],
            issuer: 'mazenet',
            audience: 'mazenet'
        }) as Observable<AuthenticationToken>;
    }

    /**
     * add a 'mazenet' provider to the user. create a new user if one is not provided
     * @param password - plaintext password
     * @param userId - if provided, try to attach this profile to an existing user. otherwise, a new user will be created
     */
    public registerProfile(username: string, password: string, userId?: User.Id): Observable<User> {
        return forkJoin(
            userId?
                // if a userid is provided, only allow attaching if the user does not have any profiles associated with it (i.e. an anonymous user)
                // TODO: add option to explicitly allow associating a username+password with an account with other profiles
                forkJoin(
                    this.getUser(userId),
                    this.dataStore.getProfiles(userId)
                ).pipe(
                    map(([user, fullProfiles]) => {
                        if(fullProfiles.length > 0) {
                            throw new BadRequestError(`user '${userId}' is already associated with one or more profiles. Log out before trying to register a new user.`);
                        }
                        return user;
                    })
                ):
                this.createUser({username}),
            from(bcrypt.hash(password, this.passwordSaltRounds))
        ).pipe(
            mergeMap(([user, hashedPassword]) => {
                const profile = new Account.Profile({
                    provider: 'mazenet',
                    id: username,
                    displayName: username,
                });

                return this.dataStore.insertProfile(user.id, profile, hashedPassword).pipe(
                    map((fullProfile) => user)
                );
            }),
            tap((user) => GlobalLogger.trace('register profile', {
                id: user.id,
                provider: 'mazenet'
            }))
        );
    }

    /**
     * try to login with username and password
     * @param password - plaintext password
     */
    public loginUser(username: string, password: string): Observable<{user: User, authenticationToken: string}> {
        return this.dataStore.getProfile('mazenet', username).pipe(
            mergeMap((fullProfile) => forkJoin(
                from(bcrypt.compare(password, fullProfile.secret)),
                of(fullProfile)
            )),
            mergeMap(([compareResult, fullProfile]) => {
                if(!compareResult) {
                    throw new UnauthorizedError('Incorrect password');
                }

                return forkJoin(
                    this.getUser(fullProfile.userId),
                    this.createAuthenticationToken(fullProfile.userId)
                );
            }),
            map(([user, authenticationToken]) => ({user, authenticationToken})),
            tap(({user, authenticationToken}) => GlobalLogger.trace('login', {
                id: user.id,
                provider: 'mazenet',
            }))
        );
    }

    public getProfiles(userId: User.Id): Observable<Map<string, Account.Profile>> {
        return this.dataStore.getProfiles(userId).pipe(
            map((fullProfiles) => {
                return new Map(fullProfiles.map((fullProfile) => {
                    return [fullProfile.profile.provider, fullProfile.profile];
                }));
            })
        );
    }

    public getAccount(userId: User.Id): Observable<Account> {
        // TODO: add account data store
        return forkJoin(
            this.getUser(userId),
            this.getProfiles(userId)
        ).pipe(
            map(([user, profiles]) => {
                return new Account({
                    user,
                    profiles: Array.from(profiles.entries()).reduce(
                        (obj, [provider, profile]) => {
                            obj[provider] = profile.toV1();
                            return obj;
                        }, {} as {[provider: string]: Api.v1.Models.Profile}
                    )
                });
            })
        );
    }

    public onUserDisconnect(sessionId: string): void {
        this.sessionDataStore.deleteActiveUserFromSession(sessionId);
    }
}
