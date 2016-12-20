var assert, expect;

assert = require('assert');

expect = require('chai').expect;

describe('webdriver.io Tangerine index page test', function() {
  return it('should be able to filter for commands', function() {
    var myElem;
    browser.url('http://localhost:8080/#class');
    myElem = browser.element('.klass_run');
    myElem.waitForVisible();
    browser.click('.klass_run');
    return expect($('.KlassPartlyView h1').getText()).to.be.equal('assessment status');
  });
});

describe('webdriver.io page', function() {
  return it('should have the right title - the fancy generator way', function() {
    var title;
    browser.url('http://webdriver.io');
    title = browser.getTitle();
    return assert.equal(title, 'WebdriverIO - Selenium 2.0 javascript bindings for nodejs');
  });
});
