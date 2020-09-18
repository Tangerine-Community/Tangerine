if [ ! $1 ]; then
 echo "You must define the version."
 exit
fi
VERSION=$1

echo "Building RC from $VERSION"
# Get the software.
git clone git@github.com:tangerine-community/tangerine tmp
cd tmp 
git checkout $VERSION 
# Set up tangerine-preview.
cd tangerine-preview
npm install
# Set up client.
cd ../client
npm install
npm run build
# Swap out.
rm -fr ../tangerine-preview/app
mv dist/tangerine-client ../tangerine-preview/app
# Release.
cd ../tangerine-preview/
npm version $VERSION
npm publish --tag rc 
# Clean up.
cd ../
rm -rf tmp
