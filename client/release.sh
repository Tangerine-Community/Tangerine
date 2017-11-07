
cp index.html build/index.html

# generate service worker
rm build/release-uuid.txt

workbox generate:sw

UUID=$(uuid)
mv build/sw.js build/$UUID.js
# generate a release uuid
echo $UUID > build/release-uuid.txt
