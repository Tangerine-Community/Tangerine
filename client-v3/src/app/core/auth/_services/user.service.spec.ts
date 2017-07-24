import { TestBed, inject } from '@angular/core/testing';

import { UserService } from './user.service';

describe('UserService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserService]
    });
  });

  it('should be created', inject([UserService], (service: UserService) => {
    expect(service).toBeTruthy();
  }));
  it('Create should create user', inject([UserService], (service: UserService) => {
    /** 1. Should create a user object, save it and then fetch from db then compare the values. Delete the revision property.JSON.stringify the two objects fo comparisions .**/
  }));

  it('Should throw an eror when saving a user with existing username', inject([UserService], (service: UserService) => {
    /**
     * Create same user with the create user and then see if it saves. If it doesnt save, the test has passed
     */
  }));
});
