import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupLocationListNewComponent } from './group-location-list-new.component';

describe('GroupLocationListNewComponent', () => {
  let component: GroupLocationListNewComponent;
  let fixture: ComponentFixture<GroupLocationListNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupLocationListNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupLocationListNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
