import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TangerineFormSessionComponent } from './tangerine-form-session.component';

describe('TangerineFormSessionComponent', () => {
  let component: TangerineFormSessionComponent;
  let fixture: ComponentFixture<TangerineFormSessionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TangerineFormSessionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TangerineFormSessionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
