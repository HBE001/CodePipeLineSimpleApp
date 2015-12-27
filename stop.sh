#!/bin/sh
cd /home/lotusinterworks.internal/yahyas/codedeploy
touch logfile
echo whoami >> logfile
pm2 stop all
