import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupUploadsViewComponent } from './group-uploads-view.component';

describe('GroupUploadsViewComponent', () => {
  let component: GroupUploadsViewComponent;
  let fixture: ComponentFixture<GroupUploadsViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupUploadsViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupUploadsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
