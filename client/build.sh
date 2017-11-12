# Build angular shell.
cd shell 
npm run build
cd ..

# Build tangy forms.
cd tangy-forms
npm run build
cd ..

# Build updater
cd app-updater
npm run build
cd ..

# Refresh the build directory.
rm -r build
mkdir build

# Copy build items over.
cp app-updater/build/default/index.html build/index.html
cp app-updater/logo.svg build/logo.svg
cp -r shell/dist/tangerine build/tangerine
cp -r tangy-forms/build/default build/tangy-forms


