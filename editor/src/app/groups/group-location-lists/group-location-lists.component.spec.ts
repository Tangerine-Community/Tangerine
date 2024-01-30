import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupLocationListsComponent } from './group-location-lists.component';

describe('GroupLocationListsComponent', () => {
  let component: GroupLocationListsComponent;
  let fixture: ComponentFixture<GroupLocationListsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupLocationListsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupLocationListsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
