#!/bin/bash
node build/server/src/main.js $* | node ./scripts/pretty-log.js
