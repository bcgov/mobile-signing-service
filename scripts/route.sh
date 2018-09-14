#!/bin/bash

if [ "$EUID" -ne 0 ]; then
  echo "Updating firewall rules requires root privileges;"
  echo "Please use sudo to run this script as root."
  exit
fi

echo "rdr pass inet proto tcp from any to any -> 127.0.0.1 port 8088" | \
pfctl -ef