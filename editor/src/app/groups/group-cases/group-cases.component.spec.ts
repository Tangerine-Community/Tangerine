import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupCasesComponent } from './group-cases.component';

describe('GroupCasesComponent', () => {
  let component: GroupCasesComponent;
  let fixture: ComponentFixture<GroupCasesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupCasesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupCasesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
