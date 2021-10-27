# Case Module Dashboard Example

To use in your own content set, copy this editor folder over your content set's editor folder. 

To start making changes, install dependencies and start the build process.

```bash
cd your-content-set/editor
npm install
npm start
```

When you have finished making changes, make sure to commit all your changes and the compiled files.

## Add a new component

1. Copy one of the existing component files in the `components` folder to file of the name you would like the component to be.
2. In your new file, rename the class declaration near the top and at the bottom of the file rename the reference to the Class in the `customElements.define()` function call.
3. In the first parameter of the `customElements.define()` call, rename the string to match your file name but without the `.js`. This will be the component name you use in HTML.
4. Using the component name you declared in the previous step, open `components/custom-app.js` and add it to the markup in that component's render function. 
5. At the top of `components/custom-app.js`, import your new component with an import statement like `import './components/your-new-component.js'`. 
