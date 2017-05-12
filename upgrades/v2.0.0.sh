#!/bin/bash
echo ""
echo ""
echo ""
echo "Running updates for 2.0.0"
echo ""
echo ""
echo ""
echo ""
echo "Symlinking node_modules from server in for helper script to use."
if [ -L "/tangerine-server/upgrades/node_modules" ]; then
  rm /tangerine-server/upgrades/node_modules
fi
ln -s /tangerine-server/server/node_modules /tangerine-server/upgrades/node_modules
echo ""
echo ""
echo ""
echo ""
echo "Running helper script v2.0.0-helper.js"
echo ""
echo ""
echo ""
cd /tangerine-server/upgrades
node v2.0.0-helper.js
rm /tangerine-server/upgrades/node_modules
