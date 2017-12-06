
if [ "$DEBUG" != "" ]; then

  echo "Starting entrypoint in DEBUG mode."

  mkdir /tangerine/server/db

  cd /tangerine/server/
  node index.js &

  cd /tangerine/client/shell
  ./node_modules/.bin/ng build --base-href /tangerine/ --watch &

  echo "Starting webpack in watch mode for /tangerine/client/tangy-forms."
  cd /tangerine/client/tangy-forms
  yarn dev

else

  echo "Starting entrypoint in PRODUCTION mode."

  # Generate release in case of new content.
  cd /tangerine/client/ \
    && ./node_modules/.bin/workbox generate:sw \
    && UUID=$(./node_modules/.bin/uuid) \
    && mv build/sw.js build/$UUID.js \
    && echo $UUID > build/release-uuid.txt \
    && echo "Release with UUID of $UUID"

  # Host static assets in build directory.
  mkdir /tangerine/server/db

  # Start the server.
  cd /tangerine/server
  node index.js
fi
