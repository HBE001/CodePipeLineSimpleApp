#!/bin/sh
cd /home/lotusinterworks.internal/yahyas/codedeploy
$ME = whoami
sudo touch $ME
sudo echo whoami >> logfile
pm2 stop all