import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TangerineFormSessionsComponent } from './tangerine-form-sessions.component';

describe('TangerineFormSessionsComponent', () => {
  let component: TangerineFormSessionsComponent;
  let fixture: ComponentFixture<TangerineFormSessionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TangerineFormSessionsComponent ]
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
