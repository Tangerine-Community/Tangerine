import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageMySchoolsListComponent } from './manage-my-schools-list.component';

describe('ManageMySchoolsListComponent', () => {
  let component: ManageMySchoolsListComponent;
  let fixture: ComponentFixture<ManageMySchoolsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageMySchoolsListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageMySchoolsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
