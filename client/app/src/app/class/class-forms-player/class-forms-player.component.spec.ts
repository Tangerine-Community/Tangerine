import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassFormsPlayerComponent } from './class-forms-player.component';

describe('ClassFormsPlayerComponent', () => {
  let component: ClassFormsPlayerComponent;
  let fixture: ComponentFixture<ClassFormsPlayerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClassFormsPlayerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassFormsPlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
