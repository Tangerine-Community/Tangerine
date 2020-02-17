import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupUploadsComponent } from './group-uploads.component';

describe('GroupUploadsComponent', () => {
  let component: GroupUploadsComponent;
  let fixture: ComponentFixture<GroupUploadsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupUploadsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupUploadsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
