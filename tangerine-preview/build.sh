BRANCH="master"
if [ $1 ]; then
BRANCH=$1
fi
echo "Building for $BRANCH"
git clone git@github.com:tangerine-community/tangerine
cd tangerine/client
npm install
npm run build
mv dist/tangerine-client ../../app
cd ../../
rm -rf tangerine
