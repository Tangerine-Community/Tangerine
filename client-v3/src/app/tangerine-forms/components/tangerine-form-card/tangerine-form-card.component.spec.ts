import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TangerineFormCardComponent } from './tangerine-form-card.component';

describe('TangerineFormCardComponent', () => {
  let component: TangerineFormCardComponent;
  let fixture: ComponentFixture<TangerineFormCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TangerineFormCardComponent ]
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
