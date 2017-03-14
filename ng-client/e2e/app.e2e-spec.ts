import { NgClientPage } from './app.po';

describe('ng-client App', () => {
  let page: NgClientPage;

  beforeEach(() => {
    page = new NgClientPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
