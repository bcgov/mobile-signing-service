#!/bin/bash

#
# Run this script at startup via launchd. It enables the pf firewall
# rules.
#

#
# Trap on TERM signals, according to Apple's launchd docs:
#
trap 'exit 1' 15

#
# Use the "ipconfig waitall" command to wait for all the interfaces to come up:
#
/usr/sbin/ipconfig waitall && \
/sbin/pfctl -ef config/pf/agent.rules

# Clean exit
exit 0
