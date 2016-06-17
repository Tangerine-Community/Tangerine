
set -v

cd /tangerine-server/brockman
bundle install --path vendor/bundle

cd /tangerine-server/decompressor
npm install

cd /tangerine-server/editor
npm install

cd /tangerine-server/robbert
npm install
# explicitly install because npm doesn't care that it's included in package.json as a dependency 
npm install nano

