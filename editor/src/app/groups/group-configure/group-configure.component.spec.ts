import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupConfigureComponent } from './group-configure.component';

describe('GroupConfigureComponent', () => {
  let component: GroupConfigureComponent;
  let fixture: ComponentFixture<GroupConfigureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupConfigureComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupConfigureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
