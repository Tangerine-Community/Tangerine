import { async, ComponentFixture, TestBed } from '@angular/core/testing';
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
      imports: [ TangerineFormsModule ]
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

  it('should display a Tangerine Page', () => {
    const tangerineFormsService = new TangerineFormsServiceTestDouble;
    component.form = tangerineFormsService.get('simpleForm');
    fixture.detectChanges();
  });

  fit('next button should be disabled until page form is valid', () => {
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

  it('should step to the next Tangerine Page', () => {
  });

  it('should step through a tree of sections', () => {
  });

  it('should skip to the next section', () => {
  });

  it('should resume', () => {
  });
});
