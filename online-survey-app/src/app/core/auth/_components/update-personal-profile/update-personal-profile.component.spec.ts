import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdatePersonalProfileComponent } from './update-personal-profile.component';

describe('UpdatePersonalProfileComponent', () => {
  let component: UpdatePersonalProfileComponent;
  let fixture: ComponentFixture<UpdatePersonalProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdatePersonalProfileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdatePersonalProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
