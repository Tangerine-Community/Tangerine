import { fakeAsync, tick, TestBed, ComponentFixture } from '@angular/core/testing';
// import { createGenericTestComponent } from '../test-utils';

import { Component, ViewChild, ViewContainerRef } from '@angular/core';
import {FormGroup, FormControl, ReactiveFormsModule} from '@angular/forms';
import {FieldType, FieldWrapper, FormlyModule} from "ng-formly";
import {NgbModule} from "@ng-bootstrap/ng-bootstrap";
import {FormlyFieldImageComponent} from "./formly-field-image.component";
// import { FormlyValueChangeEvent } from '../services/formly.event.emitter';
// import { evalStringExpression, evalExpressionValueSetter } from './../utils';

// Much of this code comes directly from the formly.field.spec.ts test.

export function evalStringExpression(expression: string, argNames: string[]) {
  try {
    return Function.bind.apply(Function, [void 0].concat(argNames.concat(`return ${expression};`)))();
  } catch (error) {
    console.error(error);
  }
}

export function evalExpressionValueSetter(expression: string, argNames: string[]) {
  try {
    return Function.bind
      .apply(Function, [void 0].concat(argNames.concat(`${expression} = expressionValue;`)))();
  } catch (error) {
    console.error(error);
  }
}

function createGenericTestComponent<T>(html: string, type: {new (...args: any[]): T}): ComponentFixture<T> {
  TestBed.overrideComponent(type, {set: {template: html}});
  // debugger;
  const fixture = TestBed.createComponent(type);
  fixture.detectChanges();
  return fixture as ComponentFixture<T>;
}

const createTestComponent = (html: string) =>
  createGenericTestComponent(html, TestComponent) as ComponentFixture<TestComponent>;

function getFormlyFieldElement(element: HTMLElement): HTMLInputElement {
  debugger;
  return <HTMLInputElement>element.querySelector('formly-field');
}

function getInputField(element: HTMLElement, index = 0): HTMLInputElement {
  return <HTMLInputElement>element.querySelectorAll('input')[index];
}

function getLabelWrapper(element: HTMLElement): HTMLElement {
  return <HTMLElement>element.querySelector('label');
}

let testComponentInputs;

describe('FormlyFieldImage Component', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestComponent, FormlyFieldText, FormlyWrapperLabel, FormlyFieldImageComponent],
      imports: [ ReactiveFormsModule,NgbModule.forRoot(),
        FormlyModule.forRoot({
          types: [
            {
              name: 'text',
              component: FormlyFieldText,
            },
            // {
            //   name: 'other',
            //   component: FormlyFieldText,
            //   wrappers: ['label'],
            // },
            { name: 'imageSelect', component: FormlyFieldImageComponent}
          ],
          // wrappers: [{
          //   name: 'label',
          //   component: FormlyWrapperLabel,
          // }],
          // manipulators: [
          //   { class: Manipulator, method: 'run' },
          // ],
        }),
      ],
    });
  });

  it('should render template option', () => {
    testComponentInputs = {
      field: { template: '<div>Nested property keys</div>'},
    };

    const fixture = createTestComponent('<formly-field [field]="field"></formly-field>');

    expect(fixture.nativeElement.innerText).toEqual('Nested property keys');
  });

  fit('should render field type', () => {
    testComponentInputs = {
      // field: {
      //   key: 'title',
      //   type: 'text',
      //   templateOptions: {
      //     placeholder: 'Title',
      //   },
      // },
          field: {
            key: 'title',
            type: 'imageSelect',
            templateOptions: {
              placeholder: 'Title',
              description: 'Please begin by selecting an airplane.',
              label: 'Select one of these',
              imageList: [
                {
                  image: 'https://ictatrti.github.io/eftouch-test1/assets/airplane.png',
                  value: 'airplane',
                  audio: 'url1'
                },{
                  image: 'https://ictatrti.github.io/eftouch-test1/assets/apple.png',
                  value: 'apple',
                  audio: 'url2'
                },{
                  image: 'https://ictatrti.github.io/eftouch-test1/assets/banana.png',
                  value: 'banana',
                  audio: 'url3'
                },
              ]
            },
          },
      form: new FormGroup({title: new FormControl()}),
    };

    const fixture = createTestComponent('<formly-field [form]="form" [field]="field"></formly-field>');

    expect(getLabelWrapper(fixture.nativeElement)).toBeDefined();
    expect(getInputField(fixture.nativeElement).getAttribute('value')).toEqual('airplane');
  });
});

@Component({selector: 'formly-formly-field-test', template: '', entryComponents: []})
class TestComponent {
  field = testComponentInputs.field;
  form = testComponentInputs.form;
  model = testComponentInputs.model || {};

  changeModel(event) {}
}

@Component({
  selector: 'formly-field-text',
  template: `<input type="text" [formControl]="formControl" [formlyAttributes]="field">`,
})
export class FormlyFieldText extends FieldType {}

@Component({
  selector: 'formly-wrapper-label',
  template: `
    <label [attr.for]="id">{{to.label}}</label>
    <ng-container #fieldComponent></ng-container>
  `,
})
export class FormlyWrapperLabel extends FieldWrapper {
  @ViewChild('fieldComponent', {read: ViewContainerRef}) fieldComponent: ViewContainerRef;
}

export class Manipulator {
  run(fc) {
    fc.templateManipulators.postWrapper.push((field) => {
      if (field && field.templateOptions && field.templateOptions.postWrapper) {
        return 'label';
      }
    });

    fc.templateManipulators.preWrapper.push((field) => {
      if (field && field.templateOptions && field.templateOptions.preWrapper) {
        return 'label';
      }
    });
  }
}

// This is useful when debugging issues with this custom field. Instead of importing the field, use this one.
// @Component({
//   selector: 'formly-field-image',
//   template: `<div *ngIf='imageList'>hii
//       <div *ngFor="let image of imageList" ngbRadioGroup  [formControl]="formControl">
//         <label class="btn btn-primary custom-control custom-radio">
//           <input type="radio" value="{{image.value}}"><img src="{{image.image}}" width="150">
//           <span class="custom-control-indicator"></span>
//         </label>
//       </div>
//     </div>
// `,
// })
// export class FormlyFieldImageComponent extends FieldType {
//   get imageList() {
//     if (this.to['imageList']) {
//       return this.to['imageList'];
//     }
//     return null;
//   }
//
//   get imageValue() {
//     return console.log("hey")
//   }
// }
