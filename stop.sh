#!/bin/sh
touch log_file
echo whoami >> log_file
pm2 stop all
