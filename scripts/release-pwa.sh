rm -r /tangerine/client/release/pwa
cp -r /tangerine/client/containers/pwa/build/default/* /tangerine/client/release/pwa
cp -r /tangerine/client/shell/dist/ /tangerine/client/containers/pwa/build/default/tangerine
cp -r /tangerine/client/tangy-forms/dist /tangerine/client/containers/pwa/build/default/tangy-forms
cp -r /tangerine/data/content /tangerine/client/release/pwa/

# Generate release in case of new content.
cd /tangerine/client/release/
  
workbox generate:sw
UUID=$(uuid)
mv build/sw.js build/$UUID.js
echo $UUID > build/release-uuid.txt
echo "Release with UUID of $UUID"
