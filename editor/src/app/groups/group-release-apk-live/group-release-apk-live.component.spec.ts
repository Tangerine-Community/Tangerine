import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupReleaseApkLiveComponent } from './group-release-apk-live.component';

describe('GroupReleaseApkLiveComponent', () => {
  let component: GroupReleaseApkLiveComponent;
  let fixture: ComponentFixture<GroupReleaseApkLiveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupReleaseApkLiveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupReleaseApkLiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
