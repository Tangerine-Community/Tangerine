import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TangerineFormPageComponent } from './tangerine-form-page.component';
import {TangerineFormsModule} from "../../tangerine-forms.module";
import {FormGroup} from "@angular/forms";

let testComponentInputs;

describe('TangerineFormPageComponent', () => {
  let component: TangerineFormPageComponent;
  let fixture: ComponentFixture<TangerineFormPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ TangerineFormsModule ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    let model = {
      'name': 'boop',
    }
    let fields = [{
      className: 'row',
      fieldGroup: [
        {
          type: 'input',
          key: 'name',
          templateOptions: {
            label: 'Group Name',
            type: 'text',
          }
        }
      ]
    }]
    // TestBed.overrideComponent(TangerineFormPageComponent, {set: {model: model}});
    fixture = TestBed.createComponent(TangerineFormPageComponent);
    component = fixture.componentInstance;
    // component.form.

    fixture.detectChanges();
  });

  fit('should be created', () => {
    let testComponentInputs = {
      fields: [{
        fieldGroup: [{
          key: 'name',
          type: 'text',
        }],
      }, {
        key: 'investments',
        type: 'repeat',
        fieldArray: {
          fieldGroup: [{
            key: 'investmentName',
            type: 'text',
          }],
        },
      }],
      form: new FormGroup({}),
      options: {},
      model: {
        investments: [{investmentName: 'FA'}, {}],
      },
    };

    expect(component).toBeTruthy();
  });
});
