import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupReleasesComponent } from './group-releases.component';

describe('GroupReleasesComponent', () => {
  let component: GroupReleasesComponent;
  let fixture: ComponentFixture<GroupReleasesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupReleasesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupReleasesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
