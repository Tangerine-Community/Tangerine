import { TestBed, inject } from '@angular/core/testing';

import { UploadGuardService } from './upload-guard.service';

describe('UploadGuardService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UploadGuardService]
    });
  });

  it('should be created', inject([UploadGuardService], (service: UploadGuardService) => {
    expect(service).toBeTruthy();
  }));
});
