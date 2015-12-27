#!/bin/sh
cd /home/lotusinterworks.internal/yahyas/simpliadeployment
sudo chmod +x setup_nginx_debug_repo.sh
sudo ./setup_nginx_debug_repo.sh yahya 3001 3002
sudo pm2 start app.js --node-args="--debug=3002"
