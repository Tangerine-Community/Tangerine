import { TestBed } from '@angular/core/testing';

import { CaseDefinitionsService } from './case-definitions.service';
import { provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';

describe('CaseDefinitionsService', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [], providers: [provideHttpClient(withXhr(), withInterceptorsFromDi())] }));

  it('should be created', () => {
    const service: CaseDefinitionsService = TestBed.inject(CaseDefinitionsService);
    expect(service).toBeTruthy();
  });
});
