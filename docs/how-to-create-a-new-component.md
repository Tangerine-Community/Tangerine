# How to create a new Component

1. If your component is appropriate for a separate module, generate a new module with `ng generate module your-module-name`.
1. Generate component in the appropriate module `cd your-module-name; ng generate component you-component-name;`
1. Modify the generated spec `your-component-name/your-component-name.spec.ts` for the Component.
    - Remove the TestBed module configuration for declaring the component. `TestBed.configureTestingModule({ declarations: [ YourComponentName ] })` should become `TestBed.configureTestingModule({ })`.
    - Do an ES Import of the parent module with `import { YourModuleName } from '../you-module-name.module';`.
    - Do an Angular Module Import of that Module Class by modifying `TestBed.configureTestingModule({ imports: [ YourModuleName ] })`.
1. Modify the component's tests from using `it` function to using `fit` function.
1. Run `ng test`.
1. Chrome will open, tests will run and then click `DEBUG` which will open a new tab.
1. Open the Chrome developer tools.
1. Start development of that component. After you make a change in the code, check your console output to make sure there is not a build error.
1. If there is no build error, then refresh your DEBUG tab in Chrome to see the rendered component.
1. As you code your component, set up test doubles in your Component's spec file to feed to your component's inputs. When you see output of the component is satisfactory, write a test to verify the DOM or any Component output is what you expect.
