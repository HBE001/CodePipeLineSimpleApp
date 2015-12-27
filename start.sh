#!/bin/sh
cd /home/lotusinterworks.internal/yahyas/simpliadeployment
sudo chmod +x setup_nginx_debug_repo.sh
sudo ./setup_nginx_debug_repo.sh HelloWorldApp 3001 3002
sudo pm2 start app.js --node-args="--debug=3002"

cd simplia
sudo ./setup_nginx_debug_repo.sh SimpliaApp 3006 3007
export NODE_PATH=../node_modules
sudo pm2 start index.js --node-args="--debug=3007"

