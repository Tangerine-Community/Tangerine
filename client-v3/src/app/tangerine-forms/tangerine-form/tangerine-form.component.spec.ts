import { async, ComponentFixture, ComponentFixtureAutoDetect, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

import { TangerineFormComponent } from './tangerine-form.component';
import { TangerineFormsModule } from '../tangerine-forms.module';
import { TangerineFormsServiceTestDouble } from '../tangerine-forms-service-test-double';
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

describe('TangerineFormComponent', () => {
  let component: TangerineFormComponent;
  let fixture: ComponentFixture<TangerineFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ TangerineFormsModule ],
      // providers: [ { provide: ComponentFixtureAutoDetect, useValue: true } ]
      providers: [ ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TangerineFormComponent);
    component = fixture.componentInstance;

  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should display a Tangerine Page with two input elements', () => {
    const tangerineFormsService = new TangerineFormsServiceTestDouble;
    component.form = tangerineFormsService.get('simpleForm');
    fixture.detectChanges();
    const inputElements = fixture.debugElement.queryAll(By.css('input'));
    expect(inputElements.length).toEqual(2);
  });

  it('next button should be disabled until page form is valid', () => {
    const tangerineFormsService = new TangerineFormsServiceTestDouble;
    component.form = tangerineFormsService.get('simpleForm');
    fixture.detectChanges();
    const tangerinePage = fixture.debugElement.query(By.css('app-tangerine-page'));
    tangerinePage.componentInstance.form.controls.question1.setValue('foo');
    tangerinePage.componentInstance.form.controls.question2.setValue('bar');
    fixture.detectChanges();
    const nextButtonEl = (fixture.debugElement.query(By.css('.next'))).nativeElement;
    expect(nextButtonEl.disabled).toBe(false);
  });

  it('should emit new result and step to the next Tangerine Page', () => {
    const tangerineFormsService = new TangerineFormsServiceTestDouble;
    let formResult = {};
    component.form = tangerineFormsService.get('simpleForm');
    fixture.detectChanges();
    component.resultUpdate.subscribe((freshResult) => {
      console.log(freshResult);
      formResult = freshResult;
    });

    const tangerinePage = fixture.debugElement.query(By.css('app-tangerine-page'));
    tangerinePage.componentInstance.form.controls.question1.setValue('foo');
    tangerinePage.componentInstance.form.controls.question2.setValue('bar');
    fixture.detectChanges();

    const nextButtonEl = (fixture.debugElement.query(By.css('.next'))).nativeElement;
    click(nextButtonEl);
    fixture.detectChanges();
    debugger;

    const tangerinePageTwo = fixture.debugElement.query(By.css('app-tangerine-page'));
    debugger;
    tangerinePage.componentInstance.form.controls.question3.setValue('baz');
    tangerinePage.componentInstance.form.controls.question4.setValue('yar');
    debugger;
    const doneButtonEl = (fixture.debugElement.query(By.css('.done'))).nativeElement;
    click(doneButtonEl);
    fixture.detectChanges();
  });

  it('should step through a tree of sections', () => {
  });

  it('should skip to the next section', () => {
  });

  it('should resume', () => {
  });
});
