#!/bin/sh
touch log_file
echo whoami >> log_file
cd ~/codedeploy
pm2 stop all
