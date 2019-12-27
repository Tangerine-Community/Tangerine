if [ ! $1 ]; then
 echo "You must define the version."
 exit
fi
BRANCH=$1
echo "Building for $BRANCH"
cd tangerine-preview
npm install
./build.sh $1
npm version $1
npm publish
cd ../
