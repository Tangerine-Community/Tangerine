import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SchoolsVisitedComponent } from './schools-visited.component';
import { CaseManagementModule } from '../case-management.module'
import { AppRoutingModule } from 'src/app/app-routing.module';

describe('SchoolsVisitedComponent', () => {
  let component: SchoolsVisitedComponent;
  let fixture: ComponentFixture<SchoolsVisitedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ 
        CaseManagementModule,
        AppRoutingModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SchoolsVisitedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
