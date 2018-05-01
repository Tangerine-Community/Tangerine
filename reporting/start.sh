#!/bin/bash
echo 'node version is...'
node -v
export NVM_DIR="$HOME/.nvm" && \
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" && \ 
nvm use 8 && \
node -v && \
node index.js
