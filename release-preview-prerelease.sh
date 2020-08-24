if [ ! $1 ]; then
 echo "You must define the version."
 exit
fi
VERSION=$1
echo "Building beta from next branch for $VERSION"
cd tangerine-preview
npm install
git clone git@github.com:tangerine-community/tangerine tmp
cd tmp 
git checkout $VERSION 
cd client
npm install
npm run build
rm -fr ../../app
mv dist/tangerine-client ../../app
cd ../../
rm -rf tmp
npm version $VERSION
npm publish --tag prerelease
cd ../
