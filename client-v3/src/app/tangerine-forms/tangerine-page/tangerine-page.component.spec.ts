import { DebugElement } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {Validators, FormGroup} from '@angular/forms';
import { TangerineFormsModule } from '../tangerine-forms.module';
import { TangerinePageComponent } from './tangerine-page.component';
import { TangerinePageConfig } from './tangerine-page-config';

/** Button events to pass to `DebugElement.triggerEventHandler` for RouterLink event handler */
const ButtonClickEvents = {
   left:  { button: 0 },
   right: { button: 2 }
};

/** Simulate element click. Defaults to mouse left-button click event. */
function click(el: DebugElement | HTMLElement, eventObj: any = ButtonClickEvents.left): void {
  if (el instanceof HTMLElement) {
    el.click();
  } else {
    el.triggerEventHandler('click', eventObj);
  }
}

describe('TangerinePageComponent', () => {
  let component: TangerinePageComponent;
  let fixture: ComponentFixture<TangerinePageComponent>;
  let nextButtonEl: DebugElement;
  const config = [{
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
    component.config = config;
    nextButtonEl = (fixture.debugElement.query(By.css('.next'))).nativeElement;
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
    expect(JSON.stringify(emittedModel)).toBe(JSON.stringify({ question1: 'foo', question2: undefined }));
    component.form.controls.question2.setValue('bar');
    expect(JSON.stringify(emittedModel)).toBe(JSON.stringify({ question1: 'foo', question2: 'bar' }));
  });

  it('should emit expected model when done', () => {
    const expectedModel = { question1: 'foo', question2: 'bar' };
    let emittedModel: object;
    component.form.controls.question1.setValue('foo');
    component.form.controls.question2.setValue('bar');
    component.submit.subscribe((formModel: object) => {
      emittedModel = formModel;
    });
    click(nextButtonEl);
    // TODO: For some reason we have to JSON.stringify the Model to get them to match.
    // expect(emittedModel).toBe(expectedModel);
    expect(JSON.stringify(emittedModel)).toBe(JSON.stringify(expectedModel));
  });

  it('should populate from model', () => {
    const model = { question1: 'foo', question2: 'bar' };
    component.model = model;
    fixture.detectChanges();
    const inputElements = fixture.debugElement.queryAll(By.css('input'));
    expect(inputElements[0].nativeElement.value).toBe('foo');
    expect(inputElements[1].nativeElement.value).toBe('bar');
  });

}); ;
