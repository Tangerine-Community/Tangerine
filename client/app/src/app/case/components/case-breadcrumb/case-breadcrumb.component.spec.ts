import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CaseBreadcrumbComponent } from './case-breadcrumb.component';

describe('CaseBreadcrumbComponent', () => {
  let component: CaseBreadcrumbComponent;
  let fixture: ComponentFixture<CaseBreadcrumbComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CaseBreadcrumbComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CaseBreadcrumbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
