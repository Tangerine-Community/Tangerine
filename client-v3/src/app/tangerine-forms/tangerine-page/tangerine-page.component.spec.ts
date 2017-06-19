import { DebugElement } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {Validators, FormGroup} from '@angular/forms';
import { TangerineFormsModule } from '../tangerine-forms.module';
import { TangerinePageComponent } from './tangerine-page.component';
import { TangerinePageConfig } from './tangerine-page-config';

describe('TangerinePageComponent', () => {
  let component: TangerinePageComponent;
  let fixture: ComponentFixture<TangerinePageComponent>;
  const tangerinePageConfigStub = [{
    className: 'row',
    fieldGroup: [{
        key: 'question1',
        type: 'input',
        templateOptions: {
            type: 'text',
            label: 'Question 1'
        },
        validators: {
          validation: Validators.compose([Validators.required])
        }
    }, {
        key: 'question2',
        type: 'input',
        templateOptions: {
            type: 'text',
            label: 'Question 2'
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
    component.config = tangerinePageConfigStub;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should show two input elements', () => {
    const inputElements = fixture.debugElement.queryAll(By.css('input'));
    expect(inputElements.length).toEqual(2);
  });

  it('should emit data on user input', () => {
    let emittedModel: object;
    component.update.subscribe((formModel: object) => {
      emittedModel = formModel;
    });
    component.form.controls.question1.setValue('foo');
    expect(JSON.stringify(emittedModel)).toBe(`{"status":"INVALID","variables":{"question1":"foo"}}`);
    component.form.controls.question2.setValue('bar');
    expect(JSON.stringify(emittedModel)).toBe(`{"status":"VALID","variables":{"question1":"foo","question2":"bar"}}`);
  });

  it('should be valid when done', () => {
    component.form.controls.question1.setValue('foo');
    component.form.controls.question2.setValue('bar');
    expect(component.form.status).toBe('VALID');
  });

  it('should populate from model', () => {
    const model = { question1: 'foo', question2: 'bar' };
    component.model = model;
    fixture.detectChanges();
    debugger;
    const inputElements = fixture.debugElement.queryAll(By.css('input'));
    expect(inputElements[0].nativeElement.value).toBe('foo');
    expect(inputElements[1].nativeElement.value).toBe('bar');
  });

}); ; ;
