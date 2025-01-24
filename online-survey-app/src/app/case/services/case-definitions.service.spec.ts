import { TestBed } from '@angular/core/testing';

import { CaseDefinitionsService } from './case-definitions.service';
import { HttpClientModule } from '@angular/common/http';

describe('CaseDefinitionsService', () => {
  beforeEach(() => TestBed.configureTestingModule({imports: [ HttpClientModule ]}));

  it('should be created', () => {
    const service: CaseDefinitionsService = TestBed.get(CaseDefinitionsService);
    expect(service).toBeTruthy();
  });
});
