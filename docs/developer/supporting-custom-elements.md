# Supporting custom elements and external libs

## Adding new elements

To add a new custom element or to add support for new polymer or other web components, you must make them accessible to Angular:
- add to package.json
- import into polyfills

You also need to add CUSTOM_ELEMENTS_SCHEMA to your module to support custom tags in your templates:

```js
schemas: [CUSTOM_ELEMENTS_SCHEMA],
```
## Manual imports

Some libs need to be imported manually because they are not available as ES6 modules. Add the lib using a script tag - 

```html
<script src="./libs/plotly-latest.min.js"></script>
```

and then add to angular.json:

```js
"assets": [
    "src/libs/plotly-latest.min.js"
]
```

## Resolving incompatibilities

The `"skipLibCheck": true` switch in tscondig.json will causes type checking of declaration files (files with extension .d.ts) to be skipped. ([Stack Overflow discussion](https://stackoverflow.com/questions/52311779/usage-of-the-typescript-compiler-argument-skiplibcheck)) If you run into an error such as `ERROR in node_modules/tangy-form/tangy-form-response-model.d.ts:18:17 - error TS1039: Initializers are not allowed in ambient contexts.` this switch may be useful to getting the app to compile. We decided to not use it - simply removing it worked fine - but if it's a choice between the app compiling or not, it's worth using.
