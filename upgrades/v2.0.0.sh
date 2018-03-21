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
if [ -L "/tangerine/upgrades/node_modules" ]; then
  rm /tangerine/upgrades/node_modules
fi
ln -s /tangerine/server/node_modules /tangerine/upgrades/node_modules
echo ""
echo ""
echo ""
echo ""
echo "Running helper script v2.0.0-helper.js"
echo ""
echo ""
echo ""
cd /tangerine/upgrades
node v2.0.0-helper.js
rm /tangerine/upgrades/node_modules
