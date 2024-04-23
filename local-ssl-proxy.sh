#!/bin/sh
set -e
# Follow the instructions in the README to install the local-ssl-proxy package.
# [Reverse Proxy for Developers](./docs/developer/reverse-proxy-for-developers.md) 
echo "Running local-ssl-proxy.sh - "
local-ssl-proxy --source 443 --target 80 --cert ~/ssl/server.crt --key ~/ssl/server.key