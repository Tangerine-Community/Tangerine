import { Test, TestingModule } from '@nestjs/testing';
import { TangerineConfigService } from './tangerine-config.service';

describe('TangerineConfigService', () => {
  let service: TangerineConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TangerineConfigService],
    }).compile();

    service = module.get<TangerineConfigService>(TangerineConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
