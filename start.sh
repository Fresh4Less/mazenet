#!/bin/bash
/usr/local/bin/forever -a -l forever.log -o out.log -e err.log --workingDir /srv/nodeserver/mazenet start /srv/nodeserver/mazenet/server.js
