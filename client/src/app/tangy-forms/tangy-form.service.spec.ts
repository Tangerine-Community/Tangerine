import { TestBed } from '@angular/core/testing';

import { TangyFormService } from './tangy-form.service';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from '../shared/shared.module';

describe('TangyFormService', () => {
  beforeEach(() => TestBed.configureTestingModule({imports: [HttpClientModule, SharedModule]}));

  it('should be created', () => {
    const service: TangyFormService = TestBed.get(TangyFormService);
    expect(service).toBeTruthy();
  });
});
