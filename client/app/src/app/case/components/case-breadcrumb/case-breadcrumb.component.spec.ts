import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CaseBreadcrumbComponent } from './case-breadcrumb.component';
import { CaseModule } from '../../case.module';
import { AppRoutingModule } from 'src/app/app-routing.module';

describe('CaseBreadcrumbComponent', () => {
  let component: CaseBreadcrumbComponent;
  let fixture: ComponentFixture<CaseBreadcrumbComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CaseModule,
        AppRoutingModule
      ]
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
