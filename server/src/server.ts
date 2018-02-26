import * as Express from 'express';
import * as fs from 'fs';
import * as Http from 'http';
import * as Https from 'https';
import * as Path from 'path';
import { Observable, Observer } from 'rxjs';
import { EventTargetLike } from 'rxjs/observable/FromEventObservable';
import * as SocketIO from 'socket.io';

import * as BodyParser from 'body-parser';
import * as Compression from 'compression';
import * as CookieParser from 'cookie-parser';

//import * as SocketIOCookieParser from 'socket.io-cookie-parser';

import { GlobalLogger } from './util/logger';

import * as Mazenet from './mazenet';

export namespace Server {
    /** Server constructor options */
    export interface Options {
        /** Insecure HTTP port, if0, let OS pick */
        port: number;
        /** HTTPS port, if0, let OS pick */
        securePort: number;
        /** path to a directory containing key.pem and cert.pem cert files */
        sslCertPath?: string;
        /** ifset to 'prod', use stricter settings (SSL required) */
        env: string;
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

    public options: Server.Options;
    public httpServer: Http.Server | Https.Server;
    public secureRedirectServer: Http.Server | null;
    public app: Express.Express;
    public socketServer: SocketIO.Server;
    public usingSsl: boolean;

    constructor(options: Partial<Server.Options>) {
        // TODO: put this in util
        // delete null/undefined options so Object.assign doesn't copy them
        Object.keys(options).forEach((optName: string) => {
            if((options as any)[optName] == null) {
                delete (options as any)[optName];
            }
        });

        this.options = Object.assign({}, Server.defaultOptions, options);
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
            GlobalLogger.info('Server: configuration', this.options);
            this.app = Express();

            let sslCert: Certificate | null = null;
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
                listeningObservable = Observable.race(
                    Observable.forkJoin(
                        // Don't love these type assertions but it works
                        Observable.fromEvent(this.httpServer as any as EventTargetLike, 'listening').first(),
                        Observable.fromEvent(this.secureRedirectServer as any as EventTargetLike, 'listening').first()),
                    Observable.fromEvent(this.httpServer as any as EventTargetLike, 'error').map((err: any) => {
                        throw err;
                    }).first(),
                    Observable.fromEvent(this.secureRedirectServer as any as EventTargetLike, 'error').map((err: any) => {
                        throw err;
                    })
                ).map(() => {
                    GlobalLogger.info('Server: bound to port', {
                        port: this.httpServer.address().port,
                        redirectPort: this.secureRedirectServer!.address().port,
                        ssl: this.usingSsl
                    });
                });

                this.httpServer.listen(this.options.securePort);
                this.secureRedirectServer.listen(this.options.port);
            } else if(this.options.env === 'prod') {
                GlobalLogger.fatal('SSL must be enabled in production mode. Shutting down...');
                throw new Error('SSL must be enabled in production mode.');
            } else {
                GlobalLogger.warn('WARNING: SSL not enabled. Website is NOT SECURE');
                this.usingSsl = false;
                this.httpServer = new Http.Server(this.app);
                listeningObservable = Observable.race(
                    Observable.fromEvent(this.httpServer as any as EventTargetLike, 'listening').first(),
                    Observable.fromEvent(this.httpServer as any as EventTargetLike, 'error').map((err: any) => {
                        throw err;
                    }).first(),
                ).map(() => {
                    GlobalLogger.info('Server: bound to port', {
                        port: this.httpServer.address().port,
                        ssl: this.usingSsl
                    });
                });

                this.httpServer.listen(this.options.port);
            }

            this.app.use(Compression());
            this.app.use(BodyParser.json());
            this.app.use(CookieParser());

            // setting wsEngine prevents crash when starting more than one websocket instance (e.g. in tests)
            // https://github.com/socketio/engine.io/issues/521
            this.socketServer = SocketIO(this.httpServer, {wsEngine: 'ws'} as SocketIO.ServerOptions);
            //this.socketServer.use(SocketIOCookieParser());

            const mazenet = new Mazenet.Mazenet(this.app, this.socketServer);
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
