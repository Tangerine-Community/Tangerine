import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditIssueComponent } from './edit-issue.component';

describe('EditIssueComponent', () => {
  let component: EditIssueComponent;
  let fixture: ComponentFixture<EditIssueComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditIssueComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditIssueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
