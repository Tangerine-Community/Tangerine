import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupMediaComponent } from './group-media.component';

describe('GroupMediaComponent', () => {
  let component: GroupMediaComponent;
  let fixture: ComponentFixture<GroupMediaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupMediaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupMediaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
