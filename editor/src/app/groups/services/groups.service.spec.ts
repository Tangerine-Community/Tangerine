import { TestBed, inject } from '@angular/core/testing';

import { GroupsService } from './groups.service';

describe('GroupsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GroupsService]
    });
  });

  it('should be created', inject([GroupsService], (service: GroupsService) => {
    expect(service).toBeTruthy();
  }));
});
