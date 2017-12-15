# Tangerine Forms

```
## system dependencies
npm install -g bower http-server
## get the code
git clone git@github.com:tangerine-community/tangerine
cd tangerine
git checkout v3.x.x
## install
cd tangerine-forms
bower install
## start the no-cache server in the tangerine-forms directory
http-server -c-1
```

Note how there is a forms directory at `./tangerine-forms/forms/` where each form has its own directory. In each of those
directoryies there is a `form.html` which describes the item flow of the form and the top level skip logic and then a
corresponding item HTML file for each item. A `form.html` __must__ have a `<tangy-form id="...">` tag where the id property
is important for distinguishing form response records in the database. If an item HTML file is going to have form elements,
it must have a top level `<form>` tag that the form elements are children of. The `./tangerine-forms/form-1/` form is currently
the best example of the capabilities of Tangerine Forms while the EGRA Demo form is a work in progress and is not taking advantage of all the new features.

To create a new form, create a folder in `./tangerine-forms/forms/<your form name>`, a new form HTML file at `./tangerine-forms/forms/<your form name>/form.html`,
and then add it to the `./tangerine-forms/forms.json` file so that it will show up in the list of forms available in the UI.

# es5 support

There is support for transpiling the es6 code to es5, using Babel.
To generate es5 versions in the tangy-forms-build directory:

## init the build dir

Transpiled files are saved to tangy-forms/dist directory.

```
cd tangy-forms
yarn run build
```

## watch for changes

```
cd tangy-forms
yarn run dev
```

and in another console

```
yarn run dev:mod
```

This yarn target watches for changes on a small number of web components. You may need to modify, or better, refactor this
target to include the files you may be working on.

# Viewing demos

cd to client and run `yarn start` to run the http-server.

## Ckeditor5

The ckeditor5 editor is built using webpack. Use `yarn ckeditor` to build it.

Configure the ckeditor plugin at tangy-forms/src/ckeditor.js. Output is at tangy-forms/src/tangy--textarea/build.

If you make any changes to ckeditor, be sure to run `yarn dev-mod` on the tangy-forms source code to view the updated ckeditor.
ckeditor.js is imported and is part of the webpack bundle. It is a bundle inside a bundle!

Discussion and screenshots here: https://github.com/ckeditor/ckeditor5-widget/issues/3#issuecomment-341706772

### Ckeditor5 plugins

Create a repo on github for the plugin and install into tangerine-forms. Add the plugin to build-config.js and to src/tangy-form/ckeditor.js.

Ckeditor5 plugin example and detailed plugin documentation : https://github.com/chrisekelley/ckeditor5-acasi

Do not use `npm link` when developing a plugin for ckeditor5. The command `npm link` and webpack do not work well together.
Instead, use the [wml](https://github.com/wix/wml) to copy changed files.

```
brew update
brew install watchman
```

wml add  ~/source/Tangerine-Community/ckeditor5-acasi ~/source/Tangerine-Community/Tangerine-3.x.x/Tangerine/tangerine-forms/node_modules/ckeditor5-acasi
wml start
