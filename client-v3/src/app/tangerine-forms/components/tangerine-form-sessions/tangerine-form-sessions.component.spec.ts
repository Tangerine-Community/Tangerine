import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TangerineFormsModule } from '../../tangerine-forms.module';

import { TangerineFormSessionsComponent } from './tangerine-form-sessions.component';

describe('TangerineFormSessionsComponent', () => {
  let component: TangerineFormSessionsComponent;
  let fixture: ComponentFixture<TangerineFormSessionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ TangerineFormsModule ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TangerineFormSessionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
