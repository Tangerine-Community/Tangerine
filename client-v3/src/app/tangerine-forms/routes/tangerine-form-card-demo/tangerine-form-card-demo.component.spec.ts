import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TangerineFormCardDemoComponent } from './tangerine-form-card-demo.component';

describe('TangerineFormCardDemoComponent', () => {
  let component: TangerineFormCardDemoComponent;
  let fixture: ComponentFixture<TangerineFormCardDemoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TangerineFormCardDemoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TangerineFormCardDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
