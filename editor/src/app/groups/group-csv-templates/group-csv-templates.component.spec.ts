import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupCsvTemplatesComponent } from './group-csv-templates.component';

describe('GroupCsvTemplatesComponent', () => {
  let component: GroupCsvTemplatesComponent;
  let fixture: ComponentFixture<GroupCsvTemplatesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupCsvTemplatesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupCsvTemplatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
