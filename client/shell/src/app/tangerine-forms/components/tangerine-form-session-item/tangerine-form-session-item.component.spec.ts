import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RouterTestingModule } from '@angular/router/testing';
import { TangerineFormSessionItemComponent } from './tangerine-form-session-item.component';
import { TangerineFormsModule } from '../../tangerine-forms.module';
import { TangerineFormSession } from '../../models/tangerine-form-session';

describe('TangerineFormSessionItemComponent', () => {
  let component: TangerineFormSessionItemComponent;
  let fixture: ComponentFixture<TangerineFormSessionItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ TangerineFormsModule, RouterTestingModule ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TangerineFormSessionItemComponent);
    component = fixture.componentInstance;
    component.session = new TangerineFormSession();
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
