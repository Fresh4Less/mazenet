#!/bin/bash
/usr/local/bin/forever -a -l forever.log -o out.log -e err.log start /srv/nodeserver/mazenet/server.js
