import { TestBed } from '@angular/core/testing';

import { PeersService } from './peers.service';

describe('PeersService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PeersService = TestBed.get(PeersService);
    expect(service).toBeTruthy();
  });
});
