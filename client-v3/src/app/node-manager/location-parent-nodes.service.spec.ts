import { TestBed, inject } from '@angular/core/testing';

import { LocationParentNodesService } from './location-parent-nodes.service';

describe('LocationParentNodesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LocationParentNodesService]
    });
  });

  it('should be created', inject([LocationParentNodesService], (service: LocationParentNodesService) => {
    expect(service).toBeTruthy();
  }));
});
