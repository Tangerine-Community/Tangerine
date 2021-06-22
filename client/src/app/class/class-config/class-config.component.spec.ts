import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassConfigComponent } from './class-config.component';

describe('ClassConfigComponent', () => {
  let component: ClassConfigComponent;
  let fixture: ComponentFixture<ClassConfigComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClassConfigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
