import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TangerineFormCardComponent } from './tangerine-form-card.component';
import { TangerineFormsModule } from '../../tangerine-forms.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('TangerineFormCardComponent', () => {
  let component: TangerineFormCardComponent;
  let fixture: ComponentFixture<TangerineFormCardComponent>;

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
    fixture = TestBed.createComponent(TangerineFormCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
