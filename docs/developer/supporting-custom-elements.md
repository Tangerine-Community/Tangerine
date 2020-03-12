# Supporting custom elements

To add a new custom element or to add support for new polymer or other web components, you must make them accessible to Angular:
- add to package.json
- import into polyfills

You also need to add CUSTOM_ELEMENTS_SCHEMA to your module to support custom tags in your templates:

```js
schemas: [CUSTOM_ELEMENTS_SCHEMA],
```
