import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupReleasePwaLiveComponent } from './group-release-pwa-live.component';

describe('GroupReleasePwaLiveComponent', () => {
  let component: GroupReleasePwaLiveComponent;
  let fixture: ComponentFixture<GroupReleasePwaLiveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupReleasePwaLiveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupReleasePwaLiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
