import { TangerineFormPage } from './app.po';

describe('tangerine-form App', () => {
  let page: TangerineFormPage;

  beforeEach(() => {
    page = new TangerineFormPage();
  });

  it('should start without errors', () => {
    page.navigateTo();
    expect(true).toEqual(true)
  });

  /*
  it('should display message saying Tangerine Client v3.x.x', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('');
  });
  */
});
