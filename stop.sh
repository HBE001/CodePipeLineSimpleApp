#!/bin/sh
touch log_file
echo whoami >> log_file
cd /home/lotusinterworks.internal/yahyas/codedeploy
pm2 stop all
