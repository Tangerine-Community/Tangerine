import { TestBed } from '@angular/core/testing';

import { GroupDevicesService } from './group-devices.service';

describe('GroupDevicesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GroupDevicesService = TestBed.get(GroupDevicesService);
    expect(service).toBeTruthy();
  });
});
