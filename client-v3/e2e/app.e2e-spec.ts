import { TangerineFormPage } from './app.po';

describe('tangerine-form App', () => {
  let page: TangerineFormPage;

  beforeEach(() => {
    page = new TangerineFormPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
