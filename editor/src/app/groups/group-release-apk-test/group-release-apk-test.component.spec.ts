import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupReleaseApkTestComponent } from './group-release-apk-test.component';

describe('GroupReleaseApkTestComponent', () => {
  let component: GroupReleaseApkTestComponent;
  let fixture: ComponentFixture<GroupReleaseApkTestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupReleaseApkTestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupReleaseApkTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
