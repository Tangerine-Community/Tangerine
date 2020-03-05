import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupAuthorComponent } from './group-author.component';

describe('GroupAuthorComponent', () => {
  let component: GroupAuthorComponent;
  let fixture: ComponentFixture<GroupAuthorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupAuthorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupAuthorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
