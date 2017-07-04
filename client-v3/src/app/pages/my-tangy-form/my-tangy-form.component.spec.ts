import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyTangyFormComponent } from './my-tangy-form.component';

describe('MyTangyFormComponent', () => {
  let component: MyTangyFormComponent;
  let fixture: ComponentFixture<MyTangyFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyTangyFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyTangyFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
