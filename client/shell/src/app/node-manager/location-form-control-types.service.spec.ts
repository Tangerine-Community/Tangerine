import { TestBed, inject } from '@angular/core/testing';

import { LocationFormControlTypesService } from './location-form-control-types.service';

describe('LocationFormControlTypesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LocationFormControlTypesService]
    });
  });

  it('should be created', inject([LocationFormControlTypesService], (service: LocationFormControlTypesService) => {
    expect(service).toBeTruthy();
  }));
});
