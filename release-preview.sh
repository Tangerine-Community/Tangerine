if [ ! $1 ]; then
 echo "You must define the version."
 exit
fi
BRANCH=$1
echo "Building for $BRANCH"
git clone git@github.com:tangerine-community/tangerine-preview
cd tangerine-preview
npm install
./build.sh $1
npm version $1
npm publish
cd ../
rm -rf tangerine-preview
