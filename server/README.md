# Mazenet Server
NodeJS backend for Mazenet. Exposes the Mazenet API through an interactive WebSocket API, and a RESTFUL HTTP API.

# Install
```bash
npm install
```

# Build
```bash
gulp
```
Typescript is compiled into `build/`.

# Run
```bash
npm start

# args to server come after `--`
npm start -- --port 80
```

Run the server with pretty, colorful formatted log:
```bash
./start.sh --port 80
```

## Configuration
The server can be configured through the command line and a JSON configuration file.
Arguments passed to the command-line override values in the config file.

The configuration file can be specified with the `--config [file]` command line argument.
If not specified, the default path is `{REPO_DIR}/server/config/config.json`.

**Boolean arguments**: To pass a boolean option to the command line, simply include the flag for the option without providing a value (`--logInfo`).
To explicitly set a boolean option to false, prefix the option name with `no-` (`--no-logInfo`).

**Nested arguments**: Some options ore objects with one or more levels of nesting. These options can be passed to the command line with dot notation:
```
npm start -- --postgres.database mzDb --postgres.port 1234
```

### port (number)
Port the HTTP server is bound to. If 0, let the OS select the port.  
Default: 8080

### securePort (number)
Port the HTTPS server is bound to. If 0, let the OS select the port.  
Default: 8443

### env (string)
Execution environment (`prod`, `dev`, `test`).
If set to `prod`, enforce stricter security rules.

### postgres (object)
Connection options for the postgres database. If not specified, the in-memory data store is used.  
If the postgres option specified, you must provide matching credentials for the user in `secrets.json`.

 - database (string) - database name
 - host (string) - connection host URL
 - port (number) - connection port
 - timeout (number, optional) - query timeout in milliseconds. If 0, never timeout. Default: 0
 - user (string) - Postgres user

### clientPath (string)
Path to a directory of static files to serve.
Default: `../../../../client/build`

If explicitly set to `null`, no files are be served.

### Logging
Each enabled logger outputs line seperated JSON to stdout.
Log levels:
```
* fatal   | unrecoverable error
* error   | unhandled error
* warn    | warning
* info    | startup status and notable events
  request | http and ws requests
  trace   | operational logging
  telem   | telemetry - performance and timing data
  diag    | system diagnostic info

*Enabled by default
```

Logs are enabled/disabled with the option `log[Level]`:
```
{
	"logRequest": true,
	"logInfo": false
}
```

Enable all logs with `logAll`. Specific loggers can still be explicitly disabled:
```
{
	"logAll": true,
	"logInfo": false
}
```

## Secret configuration
Credentials and other secrets are loaded from a JSON file on startup.

The secrets file can be specified with the `secrets` option. If not specified, the default path is `{REPO_DIR}/server/secrets/secrets.json`.

### postgres (object)
Specifies credentials for postgres users. Each property describes a user, with the value being a password string.

*Within secrets.json:*
```
{
"postgres": {
	    "elliot": "elliotPassword",
	    "sam": "samPassword"
}
}
```

If the postgres configuration option is used, a password for the user must be provided.

# Development

## Generate Documentation
```bash
gulp docs
```
HTML Documentation is generated in `/docs`.

## Run Tests
```bash
npm test
```
By default, the integration tests use the in-memory data store. To test against a live Postgres database, use the postgres Jest configuration:
```bash
npm test -- --config ./jest-pg.config.js
```

## Initialize Postgres DB Schema
To create the `mazenet` Postgres schema and tables, execute the SQL commands in `./scripts/initdb.psql`.
```bash
	psql -f initdb.psql [db] [dbuser]
```
Suggested values: db=mazenet, dbuser=postgres

`initdb.psql` automatically creates the `mazenet` role if it doesn't already exist, and grants it read-write permissions on tables in the `mazenet` schema.  
The default password is `mz-db-pass`. If not on a dev environment, you should immediately change the password with the following SQL command:
```
ALTER ROLE mazenet WITH PASSWORD 'newpassword'
```

## FAQ
 - `gulp docs` produces errors saying "Experimental support for decorators is a feature that is subject to change in a future release."
   - You can ignore these errors.

