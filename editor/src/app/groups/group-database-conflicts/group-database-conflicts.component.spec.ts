import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupDatabaseConflictsComponent } from './group-database-conflicts.component';

describe('GroupDatabaseConflictsComponent', () => {
  let component: GroupDatabaseConflictsComponent;
  let fixture: ComponentFixture<GroupDatabaseConflictsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupDatabaseConflictsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupDatabaseConflictsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
