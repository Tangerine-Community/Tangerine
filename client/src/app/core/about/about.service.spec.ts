import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { AboutService } from './about.service';

describe('AboutService', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [ HttpClientModule ]}));

  it('should be created', () => {
    const service: AboutService = TestBed.get(AboutService);
    expect(service).toBeTruthy();
  });
});
