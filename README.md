# MAZENET
## [www.mazenet.net](http://mazenet.net)
## Social Web Spelunking

# Topics
 - [Quick Start](#quick-start)
    - [Installation](#installation)
    - [Usage](#usage)
 - [API](#api)
 - [Contributing](#contributing)
 - [License](#license)

# Quick Start

## Installation
```bash
$ git clone https://github.com/Fresh4Less/mazenet.git
$ cd mazenet
$ npm install
```

## Usage
```bash
$ npm start
# command line arguments go after --
$ npm start -- --logLevel=none
```

### Command line arguments

#### `--logLevel=[level]`
Highest level the access logger should print to stdout (in JSON form). Thrown errors will always
be printed to stderr, regardless of this value.

Allowed values:
 - `info`
 - `error`
 - `none`

It can be useful to set this to `none` while debugging.

# API
Mazenet server has HTTP and websocket APIs
**[Current API: v1](/docs/v1/api.md)**

# Contributing
Add your changes to a new branch. Don't forget to write unit tests.
When your branch is ready, make a pull request.

# License
MIT License

