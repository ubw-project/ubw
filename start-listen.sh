#!/bin/bash
pm2 delete ubw-api && pm2 start app.js --name ubw-api -i 0 --merge-logs -l log.log && pm2 logs
