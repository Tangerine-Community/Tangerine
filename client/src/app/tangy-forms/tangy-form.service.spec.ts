import { TestBed } from '@angular/core/testing';

import { TangyFormService } from './tangy-form.service';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from '../shared/shared.module';
import { AppModule } from '../app.module';

describe('TangyFormService', () => {
  beforeEach(() => TestBed.configureTestingModule({imports: [HttpClientModule, SharedModule, AppModule]}));

  it('should be created', () => {
    const service: TangyFormService = TestBed.get(TangyFormService);
    expect(service).toBeTruthy();
  });
});
