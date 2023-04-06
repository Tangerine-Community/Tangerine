# \<tangy-form-editor\>

[![Build Status](https://travis-ci.org/Tangerine-Community/tangy-form-editor.svg?branch=master)](https://travis-ci.org/Tangerine-Community/tangy-form-editor)

The `<tangy-form-editor>` element is a Web Component for editing the contents a `<tangy-form>`. Just place `<tangy-form-editor>` tags around your `<tangy-form>` and the editor enables, no serverside dependencies required.

[Check out the demo on CodePen](https://codepen.io/rjsteinert/pen/VwwYgQN)

## Install

Add the following global dependencies to your HTML.
```
  <link href="https://fonts.googleapis.com/css?family=Roboto:300,400,500" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css?family=Material+Icons&display=block" rel="stylesheet">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/webcomponentsjs/2.2.10/webcomponents-loader.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/redux/4.0.4/redux.js"></script>
  <script src="https://unpkg.com/js-beautify/js/lib/beautify-html.js"></script>
  <script src="https://unpkg.com/tangy-form@latest/dist/bundle.js" type="module"></script>
  <script src="https://unpkg.com/tangy-form-editor@latest/dist/bundle.js" type="module"></script>
```

### Advanced: Using a bundler
For apps using a bundler, install using NPM and then import into your app.
```
npm install --save tangy-form-editor
```

```
import `tangy-form-editor/tangy-form-editor.js`
```

You have to copy an ace build to your root directory in order to get syntax highlighting. In an `angular-cli` project (as of Angular 4) you can do this by adding the following `assets` entry to your apps build target.
```
  { "glob": "**/*", "input": "../node_modules/ace-builds/src-noconflict/", "output": "./" },
```

See related issue: https://github.com/Juicy/juicy-ace-editor/issues/39#issuecomment-406710315

## Usage
Encapsulate a `tangy-form` with `tangy-form-editor` then listen for the `tangy-form-editor`'s `change` event for updates on the form HTML.

```html
<tangy-form-editor>
  <template>
    <tangy-form id="field-demo" title="Field Demo">
      <tangy-form-item id="text_inputs_1" title="Text Inputs 1">
        <template>
          <tangy-input name="text_input_1" label="This is an input for text." type="text"></tangy-input>
        </template>
      </tangy-form-item>
      <tangy-form-item id="text_inputs_2" title="Text Inputs 2">
        <template>
          <tangy-input name="text_input_2" label="This is an input for text that is required." type="text" error-message="This is required." required></tangy-input>
        </template>
      </tangy-form-item> 
      <tangy-form-item id="summary" summary title="Summary">
        <template>
          Thank you for taking our survey.
        </template>
      </tangy-form-item> 
    </tangy-form>
  </template>
</tangy-form-editor>
<script>
  // You can listen for changes.
  document.querySelector('tangy-form-editor').addEventListener('change', event => console.log(event.detail))
  // Or at any point you can get the current formHtml from the formHtml property.
  console.log(document.querySelector('tangy-form-editor').formHtml)
</script>
```

## Develop
See [DEVELOPER.md](./DEVELOPER.md) for docs.

## Browser Compatibility
The combination of CKEditor breaking when used in Shadow DOM and Firefox / IE shadow DOM support is still behind a flag, this means this element does not currently work in Firefox and IE.

## Support for translations
Follow the instructions for the [tangy-translate](https://github.com/Tangerine-Community/tangy-translate) library to enable translated or alternate labels.

## Trademark and License
Tangerine is a registered trademark of [RTI International](https://rti.org). This software is licensed under the [GPLv3 License](https://www.gnu.org/licenses/gpl-3.0.en.html).
