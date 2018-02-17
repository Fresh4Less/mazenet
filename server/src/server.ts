import {Observable, Observer} from 'rxjs';
import { EventTargetLike } from 'rxjs/observable/FromEventObservable';
import * as fs from 'fs';
import * as Path from 'path';
import * as Http from 'http';
import * as Https from 'https';
import * as Express from 'express';
import * as SocketIO from 'socket.io';

import * as Compression from 'compression';
import * as BodyParser from 'body-parser';
import * as CookieParser from 'cookie-parser';

//import * as SocketIOCookieParser from 'socket.io-cookie-parser';

import { GlobalLogger } from './util/logger';

import * as Mazenet from './mazenet';

export namespace Server {
    export interface Options {
        port: number;
        securePort: number;
        sslCertPath?: string;
        env: string;
    }
}

interface Certificate {
    cert: Buffer,
    key: Buffer
}

export class Server {

    static readonly defaultOptions = {
        port: 9090,
        securePort: 9443,
        sslCertPath: null,
        env: 'dev'
    };

    options: Server.Options;
    httpServer: Http.Server | Https.Server;
    secureRedirectServer: Http.Server | null;
    app: Express.Express;
    socketServer: SocketIO.Server;
    usingSsl: boolean;

    constructor(options: Partial<Server.Options>) {
        this.options = Object.assign({}, Server.defaultOptions, options);
        this.usingSsl = false;
    }

    //TODO: return a promise that is resolved when setup is ready (wait for server 'listening' event is emitted)
    start(): Observable<void> {
        let listeningObservable: Observable<void>;
        try {
            //TODO: add server info to the logger (instance id, pid, etc)
            GlobalLogger.info('Server: configuration', this.options);
            this.app = Express();

            let sslCert: Certificate | null = null;
            if (this.options.sslCertPath) {
                try {
                    sslCert = this.loadCerts(this.options.sslCertPath);
                }
                catch (error) {
                    GlobalLogger.error('Failed to load SSL certificates', {error});
                }
            }

            //TODO: logs the wrong port number when options.port === 0 (using port 0 lets the OS choose a port)
            if (sslCert) {
                this.httpServer = Https.createServer({
                    cert: sslCert.cert,
                    key: sslCert.key
                }, this.app);
                this.secureRedirectServer = this.makeSecureRedirectServer(this.options.securePort);
                // succeed if both listening events are fired, but error if an error event is fired first
                this.usingSsl = true;
                listeningObservable = Observable.race(
                    Observable.forkJoin(
                        // Don't love these type assertions but it works
                        Observable.fromEvent(<EventTargetLike><any>this.httpServer, 'listening').first(),
                        Observable.fromEvent(<EventTargetLike><any>this.secureRedirectServer, 'listening').first()),
                    Observable.fromEvent(<EventTargetLike><any>this.httpServer, 'error').map((err: any) => {
                        throw err;
                    }).first(),
                    Observable.fromEvent(<EventTargetLike><any>this.secureRedirectServer, 'error').map((err: any) => {
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
            }
            else if (this.options.env === 'prod') {
                GlobalLogger.fatal('SSL must be enabled in production mode. Shutting down...');
                throw new Error('SSL must be enabled in production mode.');
            }
            else {
                GlobalLogger.warn('WARNING: SSL not enabled. Website is NOT SECURE');
                this.usingSsl = false;
                this.httpServer = new Http.Server(this.app);
                listeningObservable = Observable.race(
                    Observable.fromEvent(<EventTargetLike><any>this.httpServer, 'listening').first(),
                    Observable.fromEvent(<EventTargetLike><any>this.httpServer, 'error').map((err: any) => {
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
            this.socketServer = SocketIO(this.httpServer, <SocketIO.ServerOptions>{wsEngine: 'ws'});
            //this.socketServer.use(SocketIOCookieParser());

            let mazenet = new Mazenet.Mazenet(this.app, this.socketServer);
        }
        catch(error) {
            return <Observable<void>>Observable.throw(error);
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
        if (redirectPort !== 443) {
            redirectPortStr = ':' + redirectPort;
        }
        return new Http.Server((req: Http.IncomingMessage, res: Http.ServerResponse) => {
            try {
                let host = req.headers['host'];
                if (host) {
                    host = host.split(':')[0];
                    res.writeHead(307, {'Location': 'https://' + host + redirectPortStr + req.url});
                }
                res.end();
            }
            catch (err) {
                console.error(err);
                console.log(req.headers);
                res.writeHead(500);
                res.end();
            }
        });
    }
}
