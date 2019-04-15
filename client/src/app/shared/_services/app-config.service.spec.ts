import { TestBed, inject } from '@angular/core/testing';

import { AppConfigService } from './app-config.service';
import { SharedModule } from '../shared.module';

describe('AppConfigService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule]
    });
  });

  it('should be created', inject([AppConfigService], (service: AppConfigService) => {
    expect(service).toBeTruthy();
  }));
});
