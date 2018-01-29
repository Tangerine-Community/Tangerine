#!/usr/bin/env bash
npm run build
echo "copying ckeditor.js"
docker cp ./dist/ckeditor.js a39fb118014a:/tangerine/client/tangy-forms/dist/vendor/ckeditor.js
docker cp ./dist/ckeditor.js.map a39fb118014a:/tangerine/client/tangy-forms/dist/vendor/ckeditor.js.map
