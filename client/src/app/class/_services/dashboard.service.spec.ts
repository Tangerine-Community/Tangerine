import { TestBed, inject } from '@angular/core/testing';

import { DashboardService } from './dashboard.service';
import { ClassModule } from '../class.module';
import { WindowRef } from 'src/app/shared/_services/window-ref.service';
import { AppModule } from 'src/app/app.module';

describe('DashboardService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ ClassModule, AppModule ],
      providers: [WindowRef]
    });
  });

  it('should be created', inject([DashboardService], (service: DashboardService) => {
    expect(service).toBeTruthy();
  }));
});
