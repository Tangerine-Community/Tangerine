import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BinderExampleComponent } from './binder-example.component';

describe('BinderExampleComponent', () => {
  let component: BinderExampleComponent;
  let fixture: ComponentFixture<BinderExampleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BinderExampleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BinderExampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
