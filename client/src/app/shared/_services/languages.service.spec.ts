import { TestBed } from '@angular/core/testing';

import { LanguagesService } from './languages.service';

describe('LanguagesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LanguagesService = TestBed.get(LanguagesService);
    expect(service).toBeTruthy();
  });
});
