import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupUploadsEditComponent } from './group-uploads-edit.component';

describe('GroupUploadsEditComponent', () => {
  let component: GroupUploadsEditComponent;
  let fixture: ComponentFixture<GroupUploadsEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupUploadsEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupUploadsEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
