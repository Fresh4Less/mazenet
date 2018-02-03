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

    constructor(options: Partial<Server.Options>) {
        this.options = Object.assign({}, Server.defaultOptions, options);
    }

    //TODO: return a promise that is resolved when setup is ready (wait for server 'listening' event is emitted)
    start(): void {
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
            this.httpServer.listen(this.options.securePort);
            this.secureRedirectServer.listen(this.options.port);
            GlobalLogger.info('Server: bound to port', {
                port: this.options.securePort,
                redirectPort: this.options.port,
                ssl: true
            });

        }
        else if (this.options.env === 'prod') {
            GlobalLogger.fatal('SSL must be enabled in production mode. Shutting down...');
            throw new Error('SSL must be enabled in production mode.');
        }
        else {
            GlobalLogger.warn('WARNING: SSL not enabled. Website is NOT SECURE');
            this.httpServer = new Http.Server(this.app);
            this.httpServer.listen(this.options.port);
            GlobalLogger.info('Server: bound to port', {port: this.options.port, ssl: false});
        }

        this.app.use(Compression());
        this.app.use(BodyParser.json());
        this.app.use(CookieParser());

        this.socketServer = SocketIO(this.httpServer);
        //socketServer.use(SocketIOCookieParser());

        let mazenet = new Mazenet.Mazenet(this.app, this.socketServer);

        // socket initialization
        //let socketServer = SocketIO(this.httpServer);
        //socketServer.use((socket: SocketIO.Socket, fn) => {
        //let a = SocketIO.Socket;
        //socket.
        //});
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
