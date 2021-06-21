import { TestBed } from '@angular/core/testing';

import { FormsServiceService } from './forms-service.service';

describe('FormsServiceService', () => {
  let service: FormsServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FormsServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
