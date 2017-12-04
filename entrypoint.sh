
# Generate release in case of new content.
cd /tangerine/client/ \
  && ./node_modules/.bin/workbox generate:sw \
  && UUID=$(./node_modules/.bin/uuid) \
  && mv build/sw.js build/$UUID.js \
  && echo $UUID > build/release-uuid.txt \
  && echo "Release with UUID of $UUID"

# Host static assets in build directory.
cd /tangerine/client/build
../node_modules/.bin/http-server -c-1 -p 80


