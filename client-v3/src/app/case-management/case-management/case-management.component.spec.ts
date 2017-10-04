import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CaseManagementComponent } from './case-management.component';

describe('CaseManagementComponent', () => {
  let component: CaseManagementComponent;
  let fixture: ComponentFixture<CaseManagementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CaseManagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CaseManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
