import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupReleasePwaTestComponent } from './group-release-pwa-test.component';

describe('GroupReleasePwaTestComponent', () => {
  let component: GroupReleasePwaTestComponent;
  let fixture: ComponentFixture<GroupReleasePwaTestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupReleasePwaTestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupReleasePwaTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
