import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BehaviorCheckComponent } from './behavior-check.component';

describe('BehaviorCheckComponent', () => {
  let component: BehaviorCheckComponent;
  let fixture: ComponentFixture<BehaviorCheckComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BehaviorCheckComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BehaviorCheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
