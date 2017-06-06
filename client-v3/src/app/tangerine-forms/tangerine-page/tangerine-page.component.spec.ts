import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {Validators, FormGroup} from '@angular/forms';
import { TangerineFormsModule } from '../tangerine-forms.module';
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
      imports: [
        TangerineFormsModule
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

  it('should show two input elements', () => {
    const inputElements = fixture.debugElement.queryAll(By.css('input'));
    expect(inputElements.length).toEqual(2);
  });
});
