import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomAppComponent } from './custom-app.component';

describe('CustomAppComponent', () => {
  let component: CustomAppComponent;
  let fixture: ComponentFixture<CustomAppComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomAppComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomAppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
