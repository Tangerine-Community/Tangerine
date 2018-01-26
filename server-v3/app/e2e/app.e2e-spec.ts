import { TangerineHubPage } from './app.po';

describe('tangerine-hub App', function() {
  let page: TangerineHubPage;

  beforeEach(() => {
    page = new TangerineHubPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
