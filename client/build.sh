# Build angular shell.
cd shell 
npm run build
cd ..
# Build tangy forms.
cd tangy-forms
npm run build
cd ..
# Build legacy client.
## cd ../legacy
# npm install 
# cd ..

# Refresh the build directory.
rm -r build
mkdir build

# Copy build items over.
cp -r shell/dist/tangerine build
mv build/tangerine/index.html build/
cp -r tangy-forms/build/default build/tangy-forms
# cp -r legacy/dist build/legacy
cp -r content build/
