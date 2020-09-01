import * as cookie from 'cookie';
import * as Express from 'express';
import { from, forkJoin, Observable, of, throwError } from 'rxjs';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import * as Validator from 'fresh-validation';
import * as FreshSocketIO from 'fresh-socketio-router';

import * as Api from '../../../common/api';
import { BadRequestError, NotFoundError, Request, Response, Socket, UnauthorizedError } from '../common';

import { Room } from '../room/models';
import { Service as RoomService } from '../room/service';
import { ActiveUser, User } from './models';
import { Service } from './service';
import { GlobalLogger } from '../util/logger';

// temporary imports, won't be needed later
import * as Uuid from 'uuid/v4';

// TODO: set authenticationToken cookie to secure (HTTPS only) in production
export class Middleware {

    public service: Service;
    public roomService: RoomService;
    /** Universal router that can be used in express or fresh-socketio-router */
    public router: Express.Router;
    public socketMiddleware: (socket: Socket, fn: ( err?: any ) => void ) => void;

    constructor(service: Service, roomService: RoomService) {
        this.service = service;
        this.roomService = roomService;

        this.socketMiddleware = (socket: Socket, next: (err?: any) => void) => {
            const cookies = cookie.parse(socket.request.headers.cookie || '');
            if(!cookies.authenticationToken) {
                // websocket connection requires an authentication token
                // TODO: restructure request logs to make message more human readable, rather than a separate 'reason' message
                GlobalLogger.request('ws-handshake-failed', {
                    ip: socket.request.connection.remoteAddress,
                    transport: 'ws',
                    reason: 'missing authenticationToken'
                });
                return next(new UnauthorizedError(`Websocket connection requires a the 'authenticationToken' cookie. Obtain a token with POST /users/login`));
            }

            this.service.verifyAuthenticationToken(cookies.authenticationToken).pipe(
                catchError((err) => { throw new UnauthorizedError(`Invalid authenticationToken: ${err.message}`) }),
                mergeMap((authenticationToken) =>
                    forkJoin(
                        this.service.getUser((authenticationToken.sub)),
                        of(authenticationToken)
                    )
                ),
                catchError((err: Error) => {
                    if(err instanceof NotFoundError) {
                        // authenticationToken refers to a user that doesn't exist, rethrow as unauthorized error
                        throw new UnauthorizedError(`Invalid authenticationToken: ${err.message}`);
                    }

                    throw err;
                }),
            ).subscribe({
                next: ([user, authenticationToken]) => {
                    socket.mazenet = {
                        sessionId: socket.id,
                        userId: authenticationToken.sub
                    };

                    socket.on('disconnect', () => {
                        this.service.onUserDisconnect(socket.mazenet!.sessionId);
                    });
                    return next();
                },
                error: (error: Error) => {
                    GlobalLogger.error(
                        'Socket failed authentication handshake on connect',
                        {error}
                    );

                    return next(error);
                }
            });
        };
        this.router = Express.Router();

        this.router.use((req: Request, res: Response, next: Express.NextFunction) => {
            const socketData = (req.socket as Socket).mazenet;
            if(socketData) {
                // websocket doesn't need to validate JWT because it was validated when the connection was established
                // NOTE: should we kill long-running websocket connections that have outlived their token lifespan?
                req.userId = socketData.userId;
                return next();
            }
            else {
                if(!req.cookies.authenticationToken) {
                    // create an anonymous user for this session
                    return this.createGuest().subscribe({
                        next: ([user, authenticationToken]) => {
                            this.setAuthenticationTokenCookie(authenticationToken, res as Express.Response);
                            next();
                        },
                        error: (err) => {
                            next(err);
                        }
                    });
                }

                // every HTTP request needs to validate the JWT
                this.service.verifyAuthenticationToken(req.cookies.authenticationToken).pipe(
                    catchError((err) => throwError(new UnauthorizedError(`Invalid authenticationToken: ${err.message}`))),
                    mergeMap((authenticationToken) =>
                        forkJoin(
                            this.service.getUser((authenticationToken.sub)),
                            of(authenticationToken)
                        )
                    ),
                    catchError((err: Error) => {
                        if(err instanceof NotFoundError) {
                            // authenticationToken refers to a user that doesn't exist, rethrow as unauthorized error
                            throw new UnauthorizedError(`Invalid authenticationToken: ${err.message}`);
                        }

                        throw err;
                    }),
                    catchError((err: Error) => {
                        // if connecting to the homepage with an invalid token, automatically create a new guest and session token
                        if(err instanceof UnauthorizedError && req.url === '/') {
                            return this.createGuest().pipe(
                                mergeMap(([user, authenticationToken]) => {
                                    this.setAuthenticationTokenCookie(authenticationToken, res as Express.Response);
                                    // NOTE: we don't need to verify the token we just created, we could just decode
                                    return forkJoin(
                                        of(user),
                                        this.service.verifyAuthenticationToken(authenticationToken)
                                    );
                                })
                            );
                        }

                        throw err;
                    })
                ).subscribe({
                    next: ([user, authenticationToken]) => {
                        req.userId = authenticationToken.sub;
                        return next();
                    },
                    error: (err) => {
                        next(err);
                    }
                });
            }
        });

        const usersRouter = Express.Router();
        usersRouter.post('/login', (req: Request, res: Response, next: Express.NextFunction) => {
            const socketData = (req.socket as Socket).mazenet;
            if(socketData) {
                throw new BadRequestError('Login not allowed over websocket session. Use HTTP instead.');
            }

            let body: Api.v1.Routes.Users.Login.Post.Request;
            try {
                body = Validator.validateData(req.body, Api.v1.Routes.Users.Login.Post.Request, 'body');
            } catch (err) {
                throw new BadRequestError(err.message);
            }

            this.service.loginUser(body.username, body.password).subscribe({
                next: ({user, authenticationToken}) => {
                    this.setAuthenticationTokenCookie(authenticationToken, res as Express.Response);
                    const response: Api.v1.Routes.Users.Login.Post.Response200 = user.toV1();
                    return res.status(200).json(response);
                },
                error: (err) => {
                    next(err);
                }
            });
        });

        usersRouter.post('/register', (req: Request, res: Response, next: Express.NextFunction) => {
            const socketData = (req.socket as Socket).mazenet;
            if(socketData) {
                throw new BadRequestError('User registration not allowed over websocket session. Use HTTP instead.');
            }

            let body: Api.v1.Routes.Users.Register.Post.Request;
            try {
                body = Validator.validateData(req.body, Api.v1.Routes.Users.Register.Post.Request, 'body');
            } catch (err) {
                throw new BadRequestError(err.message);
            }

            this.service.registerProfile(body.username, body.password, req.userId).pipe(
                mergeMap((user) => {
                    // if the user does not already have a session token, create one now
                    const tokenObservable: Observable<string | undefined> = req.userId?
                        of(undefined):
                        this.service.createAuthenticationToken(user.id);
                    return tokenObservable.pipe(
                        map((authenticationToken) => [user, authenticationToken] as [User, string | undefined])
                    );
                })
            ).subscribe({
                next: ([user, authenticationToken]) => {
                    if(authenticationToken) {
                        this.setAuthenticationTokenCookie(authenticationToken, res as Express.Response);
                    }
                    const response: Api.v1.Routes.Users.Register.Post.Response201 = user.toV1();
                    res.status(201).json(user);
                },
                error: (err) => {
                    next(err);
                }
            });
        });

        usersRouter.post('/connect', (req: Request, res: Response, next: Express.NextFunction) => {
            const socketData = (req.socket as Socket).mazenet;
            if(!socketData) {
                throw new BadRequestError('Only websocket sessions can /connect to the Mazenet');
            }
            if(!req.userId) {
                throw new UnauthorizedError('User must be logged in');
            }
            let body: Api.v1.Routes.Users.Connect.Post.Request;
            try {
                body = Validator.validateData(req.body, Api.v1.Routes.Users.Connect.Post.Request, 'body');
            } catch (err) {
                throw new BadRequestError(err.message);
            }

            this.service.getUser(req.userId).pipe(
                mergeMap((user) => {
                    return forkJoin(
                        this.service.getAccount(user.id),
                        this.service.createActiveUser(socketData!.sessionId, user, body.platformData),
                        this.roomService.getRootRoomId()
                    )
                })
            ).subscribe(([account, activeUser, rootRoomId]) => {
                socketData!.activeUser = activeUser;
                const response: Api.v1.Routes.Users.Connect.Post.Response200 = {
                    account: account.toV1(),
                    activeUser: activeUser.toV1(),
                    rootRoomId,
                };

                return res.status(200).json(response);
            }, (err: Error) => {
                next(err);
            });
        });

        this.router.use('/users', usersRouter);
    }

    public createGuest(): Observable<[User, string]> {
        return this.service.createUser({username: 'anonymous'}).pipe(
            mergeMap((user) => {
                return this.service.createAuthenticationToken(user.id).pipe(
                    map((authenticationToken) => ([user, authenticationToken] as [User, string]))
                );
            })
        );
    }

    public setAuthenticationTokenCookie(authenticationToken: string, res: Express.Response) {
        (res as Express.Response).cookie('authenticationToken', authenticationToken, {httpOnly: true});
    }
}

