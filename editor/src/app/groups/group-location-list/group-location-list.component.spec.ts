import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupLocationListComponent } from './group-location-list.component';

describe('GroupLocationListComponent', () => {
  let component: GroupLocationListComponent;
  let fixture: ComponentFixture<GroupLocationListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupLocationListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupLocationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
