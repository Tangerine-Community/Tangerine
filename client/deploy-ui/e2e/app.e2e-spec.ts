import { TangerineFormPage } from './app.po';

describe('tangerine-form App', () => {
  let page: TangerineFormPage;

  beforeEach(() => {
    page = new TangerineFormPage();
  });

  it('should display message saying Tangerine Client v3.x.x', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Tangerine Client v3.x.x');
  });
});
