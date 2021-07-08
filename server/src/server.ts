import * as Express from 'express';
import * as fs from 'fs';
import * as Http from 'http';
import * as Https from 'https';
import * as Path from 'path';
import { AddressInfo } from 'net';
import { fromEvent, forkJoin, Observable, race } from 'rxjs';
import { first, map } from 'rxjs/operators';
import * as SocketIO from 'socket.io';

import { Pool, PoolConfig } from 'pg';

import * as BodyParser from 'body-parser';
import * as Compression from 'compression';
import * as CookieParser from 'cookie-parser';

//import * as SocketIOCookieParser from 'socket.io-cookie-parser';

import { KeyPair } from './common';
import { GlobalLogger } from './util/logger';

import * as Mazenet from './mazenet';

export namespace Server {
    /** Server constructor options */
    export interface Options {
        /** path to directory of cilent files that will be served on the root route */
        clientPath?: string;
        /** Insecure HTTP port, if 0, let OS pick */
        port: number;
        /** HTTPS port, if0, let OS pick */
        securePort: number;
        /** path to a directory containing key.pem and cert.pem cert files */
        sslCertPath?: string;
        /** ifset to 'prod', use stricter settings (SSL required) */
        env: string;
        /** connection options passed to node-postgres new Pool */
        postgres?: PoolConfig;
    }
}
interface Certificate {
    cert: Buffer;
    key: Buffer;
}

/**
 * Set up HTTP/HTTPS server and socket.io server and start Mazenet
 */
export class Server {

    public static readonly defaultOptions = {
        env: 'dev',
        port: 8080,
        securePort: 8443,
        sslCertPath: null,
    };

    /** if postgres option is defined, unspecified fields use these values */
    public static readonly defaultPostgresOptions: PoolConfig = {
        connectionTimeoutMillis: 1000*60*90,
        idleTimeoutMillis: 0, // disable timeout
        max: 20,
    };

    public options: Server.Options;
    public httpServer!: Http.Server | Https.Server;
    public secureRedirectServer?: Http.Server;
    public app!: Express.Express;
    public socketServer!: SocketIO.Server;
    public usingSsl: boolean;
    public postgresPool?: Pool;
    
    private jwtKeys: KeyPair;

    constructor(options: Partial<Server.Options>, jwtKeys: KeyPair) {
        this.options = Object.assign({}, Server.defaultOptions, options);
        if(this.options.postgres) {
            this.options.postgres = Object.assign({}, Server.defaultPostgresOptions, options.postgres);
        }
        this.jwtKeys = jwtKeys;
        this.usingSsl = false;
    }

    /**
     * Start the HTTP/HTTPS and Socket.io servers and initialize mazenet.
     * @return Observable<void> when servers are listening and ready for traffic
     */
    public start(): Observable<void> {
        let listeningObservable: Observable<void>;
        try {
            //TODO: add server info to the logger (instance id, pid, etc)
            
            // don't log passwords
            const cleanOptions = Object.assign({}, this.options);
            if(this.options.postgres) {
                cleanOptions.postgres = Object.assign({}, this.options.postgres);
                ['password', 'ssl'].forEach((prop) => {
                    if((<any>cleanOptions.postgres)[prop] !== undefined) {
                        (<any>cleanOptions.postgres)[prop] = '[redacted]';
                    }
                });
            }
            GlobalLogger.info('Server: configuration', cleanOptions);
            this.app = Express();

            let sslCert: Certificate | undefined;
            if(this.options.sslCertPath) {
                try {
                    sslCert = this.loadCerts(this.options.sslCertPath);
                } catch (error) {
                    GlobalLogger.error('Failed to load SSL certificates', {error});
                }
            }

            if(sslCert) {
                this.httpServer = Https.createServer({
                    cert: sslCert.cert,
                    key: sslCert.key
                }, this.app);
                this.secureRedirectServer = this.makeSecureRedirectServer(this.options.securePort);
                // succeed ifboth listening events are fired, but error ifan error event is fired first
                this.usingSsl = true;
                listeningObservable = race(
                    forkJoin(
                        // Don't love these type assertions but it works
                        fromEvent(this.httpServer, 'listening').pipe(first()),
                        fromEvent(this.secureRedirectServer, 'listening').pipe(first())),
                    fromEvent(this.httpServer, 'error').pipe(
                        map((err: any) => { throw err; }),
                        first()
                    ),
                    fromEvent(this.secureRedirectServer, 'error').pipe(
                        map((err: any) => { throw err; })
                    )
                ).pipe(
                    map(() => {
                        GlobalLogger.info('Server: bound to port', {
                            port: (this.httpServer.address() as AddressInfo).port,
                            redirectPort: (this.secureRedirectServer!.address() as AddressInfo).port,
                            ssl: this.usingSsl
                        });
                    }));

                this.httpServer.listen(this.options.securePort);
                this.secureRedirectServer.listen(this.options.port);
            } else if(this.options.env === 'prod') {
                GlobalLogger.fatal('SSL must be enabled in production mode. Shutting down...');
                throw new Error('SSL must be enabled in production mode.');
            } else {
                GlobalLogger.warn('WARNING: SSL not enabled. Website is NOT SECURE');
                this.usingSsl = false;
                this.httpServer = new Http.Server(this.app);
                listeningObservable = race(
                    fromEvent(this.httpServer, 'listening').pipe(first()),
                    fromEvent(this.httpServer, 'error').pipe(
                        map((err: any) => { throw err; }),
                        first()
                    ),
                ).pipe(
                    map(() => {
                        GlobalLogger.info('Server: bound to port', {
                            port: (this.httpServer.address() as AddressInfo).port,
                            ssl: this.usingSsl
                        });
                    })
                );

                this.httpServer.listen(this.options.port);
            }

            this.app.use(Compression());
            this.app.use(BodyParser.json());
            this.app.use(CookieParser());
            if(this.options.clientPath) {
                this.app.get(/\/.+/, Express.static(this.options.clientPath));
            }

            // setting wsEngine prevents crash when starting more than one websocket instance (e.g. in tests)
            // https://github.com/socketio/engine.io/issues/521
            this.socketServer = SocketIO(this.httpServer, {wsEngine: 'ws'} as SocketIO.ServerOptions);
            //this.socketServer.use(SocketIOCookieParser());
            if(this.options.postgres) {
                this.postgresPool = new Pool(this.options.postgres);
                // TODO: log data
                GlobalLogger.info('Initialized postgres pool');
            } else {
                GlobalLogger.info('Using in-memory data store');
            }

            const mazenet = new Mazenet.Mazenet(this.app, this.socketServer, this.jwtKeys, {postgresPool: this.postgresPool});

            if(this.options.clientPath) {
                this.app.get('/', Express.static(this.options.clientPath));
            }
        } catch (error) {
            return Observable.throw(error) as Observable<void>;
        }

        return listeningObservable;
    }

    protected loadCerts(certPath: string): Certificate {
        return {
            cert: fs.readFileSync(Path.join(certPath, 'cert.pem')),
            key: fs.readFileSync(Path.join(certPath, 'key.pem'))
        };
    }

    protected makeSecureRedirectServer(redirectPort: number): Http.Server {
        let redirectPortStr = '';
        if(redirectPort !== 443) {
            redirectPortStr = ':' + redirectPort;
        }
        return new Http.Server((req: Http.IncomingMessage, res: Http.ServerResponse) => {
            try {
                let host = req.headers.host;
                if(host) {
                    host = host.split(':')[0];
                    res.writeHead(307, {Location: 'https://' + host + redirectPortStr + req.url});
                }
                res.end();
            } catch (err) {
                GlobalLogger.error(`secure redirect error`, err);
                res.writeHead(500);
                res.end();
            }
        });
    }
}
