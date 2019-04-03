import { ClassModule } from './class.module';

describe('ClassModule', () => {
  let classModule: ClassModule;

  beforeEach(() => {
    classModule = new ClassModule();
  });

  it('should create an instance', () => {
    expect(classModule).toBeTruthy();
  });
});
