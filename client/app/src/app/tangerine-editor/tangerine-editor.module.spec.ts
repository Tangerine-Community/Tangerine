import { TangerineEditorModule } from './tangerine-editor.module';

describe('TangerineEditorModule', () => {
  let tangerineEditorModule: TangerineEditorModule;

  beforeEach(() => {
    tangerineEditorModule = new TangerineEditorModule();
  });

  it('should create an instance', () => {
    expect(tangerineEditorModule).toBeTruthy();
  });
});
