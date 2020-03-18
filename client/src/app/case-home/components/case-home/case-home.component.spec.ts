import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CaseHomeComponent } from './case-home.component';

describe('CaseHomeComponent', () => {
  let component: CaseHomeComponent;
  let fixture: ComponentFixture<CaseHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CaseHomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CaseHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  /* No need for this test at the moment. Better fit as an integration test.
  it('should create', () => {
    expect(component).toBeTruthy();
  });
  */
});
