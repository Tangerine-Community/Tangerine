
Run the following...
```
npm install
./build.sh
# Update the version.
vim package.json
git add .
git commit -m '<release number>'
git push
git tag <release number>
npm publish
```
