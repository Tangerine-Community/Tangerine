import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupAnalyticsComponent } from './group-analytics.component';

describe('GroupAnalyticsComponent', () => {
  let component: GroupAnalyticsComponent;
  let fixture: ComponentFixture<GroupAnalyticsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupAnalyticsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupAnalyticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
