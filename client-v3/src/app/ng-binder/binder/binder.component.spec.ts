import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BinderComponent } from './binder.component';

describe('BinderComponent', () => {
  let component: BinderComponent;
  let fixture: ComponentFixture<BinderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BinderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BinderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
