import { CaseModule } from './case.module';

describe('CaseModule', () => {
  let caseModule: CaseModule;

  beforeEach(() => {
    caseModule = new CaseModule();
  });

  it('should create an instance', () => {
    expect(caseModule).toBeTruthy();
  });
});
