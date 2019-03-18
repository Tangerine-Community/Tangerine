import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ObservationsByLocationComponent } from './observations-by-location.component';
import { CaseManagementModule } from '../case-management.module';
import { AppRoutingModule } from 'src/app/app-routing.module';

describe('ObservationsByLocationComponent', () => {
  let component: ObservationsByLocationComponent;
  let fixture: ComponentFixture<ObservationsByLocationComponent>;

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
    fixture = TestBed.createComponent(ObservationsByLocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
