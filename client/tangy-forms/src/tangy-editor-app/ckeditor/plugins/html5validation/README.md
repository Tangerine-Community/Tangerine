# HTML5Validation Plugin for CKEditor
The HTML5Validation plugin for CKEditor extends the core Forms plugin adding a Form Validation tab onto several elements. This allows you to add HTML5 Form Validation attributes onto your forms inside of CKEditor.

## Features Overview
* Adds Form Validation tab to textfield, textarea, radio, checkbox, and select form dialogs. The Form Validation tab allows you to set the HTML5 Required & Pattern attributes
* Adds Form Validation tab to form dialog. This allows you to add a novalidate HTML5 attribute to the form tag to disable HTML5 form validation

## Requirements
1. CKEditor version 4.4.7 or greater [http://ckeditor.com/](http://ckeditor.com/)
1. The Forms plugin for CKEditor (normally installed by default)

## Installation Instructions
1. Extract the downloaded repository
1. Copy the **html5validation** folder to your **"ckeditor/plugins/"** folder
1. Open the **"ckeditor/config.js"** file in your favorite text editor
1. Add **html5validation** to **config.extraPlugins** and save your changes. If that line isn't found, add it. EX:

> config.extraPlugins = 'html5validation';

## Credits / Tribute
This plugin was developed and is maintained by the [https://totalwebservices.net/](Total Web Services team).

A big thanks goes out to the following people & organizations:
[http://www.websiterelevance.com](WebsiteRelevance.com) - for supporting the development of the plugin.
[http://www.ckeditor.com](CKEditor) - For providing CKEditor so we could build this plugin for it.
Piotrek Reinmar Koszuliński - A developer on the CKEditor team who pointed us in the right direction with a bug we encountered during development.

## License
Licensed under GPL Version 3.0. For additional details please see the LICENSE.md file.