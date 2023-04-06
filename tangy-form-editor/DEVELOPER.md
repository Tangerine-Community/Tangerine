# Developer Documentation

## Geting your sandbox set up
```
git clone git@github.com:tangerine-community/tangy-form-editor
cd tangy-form-editor
npm install
npm start
```

## Running Tests

If running on a Mac with the M1 processor, you must run `node node_modules/polymer-cli/node_modules/wd/scripts/build-browser-scripts.js`
in order to avoid the error `cli runtime exception: Error: Cannot find module '../build/safe-execute'`

```
$ npm run test
```
Note, IE and Firefox tests will fail.

Your application is already set up to be tested via [web-component-tester](https://github.com/Polymer/web-component-tester). Run `polymer test` to run your application's test suite locally.

Or...

Run `npm start` and go to `http://theUrlStartGaveYou/test/`.



## Creating a new Widget
Is there a new type of input from the Tangy Form library you would like to support? This guide is for you.

In the `./widget` folder, you will find a number of files that correspond with available widgets that can be added as content of Tangy Form Items. Note how Widgets extend the `TangyBaseWidget` class. Note how a widget class such as `TangyCheckboxesWidget` overrides many of the `TangyBaseWidget` class. Methods that can be overriden are listed in the "Implement API" section of the the `TangyBaseWidget` class. If you do not implement one of those methods, the default from the `TangyBaseWidget` class will be used. Sometimes the base class does enough, but you will always need to override at least the `claimElement` method to distinguish what content your widget will claim in the form from the rest of the widgets. 

When writing your implement method API overrides, there are many helper methods for reducing boilerplate related to two types of Attribute API that your widget may handle: Common Attributes such as `name`, `show-if`, etc. and Label Attributes such as `label`, `error-message`, `hint-text`, etc. The base class uses these extensively and serve as a reference to how to incorporate them into your Widget. They are entirely optional as your Widget may or may not be concerned with the Label Attributes however only in rare cases will you not use the Common Attribute helpers because functionality such as `show-if` and `name` are core to how Tangy Form expects things to work yet `label` attribute and `hint-text` are not always applicable to all content.

You will also need to declare the Widget as available using the `window.tangyFormEditorWidgets.define` API and the `window.customElements` API. See other widgets for examples.

Lastly, making your widget available to add as form content is currently a hardcoded task. Open the `tangy-form-editor-add-input.js` file and add your widget to the list of available widgets in the category that makes sense. 

Unable to infer path to ace from script src, use ace.config.set('basePath', 'path') to enable dynamic loading of modes and themes or with webpack use ace/webpack-resolver