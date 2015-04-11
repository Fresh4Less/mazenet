#!/bin/bash
/usr/local/bin/forever stop /srv/nodeserver/mazenet/server.js
/usr/local/bin/forever -a -l forever.log -o out.log -e err.log --workingDir /srv/nodeserver/mazenet start /srv/nodeserver/mazenet/server.js
