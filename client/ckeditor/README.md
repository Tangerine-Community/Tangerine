# CKeditor5

This project deploys a webpack bundle at /dist

## Development

Add new custom plugins to the plugins directory. Run `npm run watch' to watch for changes. It will copy dist/ckeditor.js
and map files to ../tangy-forms/dist/vendor.

Make sure that you commit the package-lock.json file; currently we must use the 1.0.0-alpha.1 ckeditor libs.