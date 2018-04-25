import { TangerineFormPage } from './app.po';
import { browser, element, by } from 'protractor';

describe('tangerine-form App', () => {
  let page: TangerineFormPage;

  beforeEach(() => {
    page = new TangerineFormPage();
  });

  it('should start without errors', async () => {
    await page.navigateTo();
    expect(true).toEqual(true)
  });

  it('should register without errors', () => {
    const registerLink = element(by.css('.register-link'))
    registerLink.click()
    expect(element(by.css('h3')).getText()).toEqual('Register on Tangerine')
    element(by.css('input[name="username"]')).getWebElement().then((el) => {
      el['value'] = 'test-user'
    })
    element(by.css('input[name="password"]')).value = 'password'
    element(by.css('input[name="confirmPassword"]')).element['value'] = 'password'
    element(by.css('input[name="securityQuestionResponse"]')).value = 'secret security response'
    element(by.css('button[type=submit]')).click()
    expect(true).toEqual(true)
    //console.log(element(by.css('iframe')).getWebElement())

  });

});
