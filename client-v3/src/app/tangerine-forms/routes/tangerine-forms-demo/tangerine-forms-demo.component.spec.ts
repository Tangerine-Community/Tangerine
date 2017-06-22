import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TangerineFormsDemoComponent } from './tangerine-forms-demo.component';

describe('TangerineFormsDemoComponent', () => {
  let component: TangerineFormsDemoComponent;
  let fixture: ComponentFixture<TangerineFormsDemoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TangerineFormsDemoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TangerineFormsDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
