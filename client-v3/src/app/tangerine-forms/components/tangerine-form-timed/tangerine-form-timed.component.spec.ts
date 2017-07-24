import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TangerineFormTimedComponent } from './tangerine-form-timed.component';

describe('TangerineFormTimedComponent', () => {
  let component: TangerineFormTimedComponent;
  let fixture: ComponentFixture<TangerineFormTimedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TangerineFormTimedComponent ]
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
