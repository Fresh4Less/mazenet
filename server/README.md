# Mazenet Server

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

## Command line arguments
### `--port [number]`
Port the HTTP server is bound to. If 0, let the OS select the port.  
Default: 8080

### `--securePort [number]`
Port the HTTPS server is bound to. If 0, let the OS select the port.  
Default: 8443

### Logging
Each enabled logger outputs JSON to stdout. Logs are line seperated.  
Log levels:
```
* fatal   | unrecoverable error
* error   | unhandled error
* warn    | warning
* info    | startup status and notable events
  request | http and ws requests
  trace   | operational logging useful for debugging
  diag    | system diagnostic info

*Enabled by default
```

Logs can be enabled with the option `--log[Level]`:
```
--logRequest
```
or disabled with `--no-log[Level]`:
```
--no-logInfo
```

Enable all logs:
```
--logAll
```

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

## FAQ
 - `gulp docs` produces errors saying "Experimental support for decorators is a feature that is subject to change in a future release."
   - You can ignore these errors.

