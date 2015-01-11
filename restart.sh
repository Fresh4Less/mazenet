#!/bin/bash
/usr/local/bin/forever stop /srv/nodeserver/mazenet/app.js
/usr/local/bin/forever -a -l forever.log -o out.log -e err.log start /srv/nodeserver/mazenet/app.js
