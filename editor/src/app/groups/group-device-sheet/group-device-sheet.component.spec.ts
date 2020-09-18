import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupDeviceSheetComponent } from './group-device-sheet.component';

describe('GroupDeviceSheetComponent', () => {
  let component: GroupDeviceSheetComponent;
  let fixture: ComponentFixture<GroupDeviceSheetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupDeviceSheetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupDeviceSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
