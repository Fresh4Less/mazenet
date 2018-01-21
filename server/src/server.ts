import * as fs from 'fs';
import * as Path from 'path';
import * as Http from 'http';
import * as Https from 'https';
import * as Express from 'express';

import * as Compression from 'compression';
import * as BodyParser from 'body-parser';
import * as CookieParser from 'cookie-parser';

import {Config} from './config'

interface Certificate {
	cert: Buffer,
	key: Buffer
}

export class Server {

	static readonly defaultConfig = {
		port:  9090,
		secureRedirectPort: 9443,
		sslCertPath: null,
	};

	config: Config;
	httpServer: Http.Server | Https.Server;
	secureRedirectServer: Http.Server | null;
	app: Express.Express;

	constructor(config: Partial<Config>) {
		this.config = Object.assign({}, Server.defaultConfig, config);

		this.secureRedirectServer = this.makeSecureRedirectServer(this.config.secureRedirectPort);
		console.log(this.config);
	}

	start(): void {
		this.app = Express();

		let sslCert: Certificate | null = null;
		try {
			sslCert = this.loadCerts(this.config.sslCertPath);
		}
		catch(err) {
			console.error(err);
		}

		if(sslCert) {
			this.httpServer = Https.createServer({
				cert: sslCert.cert,
				key: sslCert.key
			}, this.app);
			this.secureRedirectServer = this.makeSecureRedirectServer(this.config.secureRedirectPort);
		}
		else {
			console.warn("WARNING: SSL certification path not set. Website is NOT SECURE");
			this.httpServer = new Http.Server(this.app);
		}

		console.log('Start! ' + this.config.port);
		this.app.use(Compression());
		this.app.use(BodyParser.json());
		this.app.use(CookieParser());


	}

	protected loadCerts(certPath?: string): Certificate | null {
		if(!certPath) {
			return null;
		}

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
				let host = req.headers['host'];
				if(host) {
					host = host.split(':')[0];
					res.writeHead(307, {"Location": "https://" + host + redirectPortStr + req.url});
				}
				res.end();
			}
			catch(err) {
				console.error(err);
				console.log(req.headers);
				res.writeHead(500);
				res.end();
			}
		});
	}
}
