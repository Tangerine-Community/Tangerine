import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormlyModule, FormlyBootstrapModule } from 'ng-formly';
import {Validators, FormGroup} from '@angular/forms';
import {ReactiveFormsModule} from '@angular/forms';


import { TangerinePageComponent } from './tangerine-page.component';

describe('TangerinePageComponent', () => {
  let component: TangerinePageComponent;
  let fixture: ComponentFixture<TangerinePageComponent>;
  const config = [{
    className: 'row',
    fieldGroup: [{
        className: 'col-xs-6',
        key: 'email',
        type: 'input',
        templateOptions: {
            type: 'email',
            label: 'Email address',
            placeholder: 'Enter email'
        },
        validators: {
          validation: Validators.compose([Validators.required])
        }
    }, {
        className: 'col-xs-6',
        key: 'password',
        type: 'input',
        templateOptions: {
            type: 'password',
            label: 'Password',
            placeholder: 'Password',
            pattern: ''
        },
        validators: {
          validation: Validators.compose([Validators.required])
        }
    }]
  }];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TangerinePageComponent ],
      imports: [
        ReactiveFormsModule,
        FormlyModule.forRoot(),
        FormlyBootstrapModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TangerinePageComponent);
    component = fixture.componentInstance;
    component.config = config;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  // it('should show a form', () => {
    // expect(el.textContent).toContain('Test Title');
  // });
});
