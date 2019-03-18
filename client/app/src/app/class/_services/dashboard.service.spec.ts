import { TestBed, inject } from '@angular/core/testing';

import { DashboardService } from './dashboard.service';
import { ClassModule } from '../class.module';

describe('DashboardService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ ClassModule ]
    });
  });

  it('should be created', inject([DashboardService], (service: DashboardService) => {
    expect(service).toBeTruthy();
  }));
});
