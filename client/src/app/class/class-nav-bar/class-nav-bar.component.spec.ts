import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassNavBarComponent } from './class-nav-bar.component';

describe('ClassNavBarComponent', () => {
  let component: ClassNavBarComponent;
  let fixture: ComponentFixture<ClassNavBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClassNavBarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassNavBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
