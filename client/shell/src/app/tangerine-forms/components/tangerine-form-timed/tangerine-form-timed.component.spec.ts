import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TangerineFormTimedComponent } from './tangerine-form-timed.component';
import { TangerineFormsModule } from '../../tangerine-forms.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('TangerineFormTimedComponent', () => {
  let component: TangerineFormTimedComponent;
  let fixture: ComponentFixture<TangerineFormTimedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        TangerineFormsModule,
        BrowserAnimationsModule
        ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TangerineFormTimedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
