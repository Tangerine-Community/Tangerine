
if [ "$DEBUG" != "" ]; then

  echo "Starting entrypoint in DEBUG mode."

  mkdir /tangerine/server/db

  cd /tangerine/server/
  node index.js &

  cd /tangerine/client/shell
  ./node_modules/.bin/ng build --base-href /tangerine/ --watch

else

  echo "Starting entrypoint in PRODUCTION mode."

  # Host static assets in build directory.
  mkdir /tangerine/server/db

  # Start the server.
  cd /tangerine/server
  node index.js
fi
