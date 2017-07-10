import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TangerineFormSessionItemComponent } from './tangerine-form-session-item.component';

describe('TangerineFormSessionItemComponent', () => {
  let component: TangerineFormSessionItemComponent;
  let fixture: ComponentFixture<TangerineFormSessionItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TangerineFormSessionItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TangerineFormSessionItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
