var assert, expect;

assert = require('assert');

expect = require('chai').expect;

describe('webdriver.io Tangerine index page test', function() {
  return it('should be able to filter for commands', function() {
    var results;
    browser.url('http://webdriver.io/api.html');
    $('.searchbar input').setValue('getT');
    results = $$('.commands.property a').filter(function(link) {
      return link.isVisible();
    });
    expect(results.length).to.be.equal(3);
    results[1].click();
    console.log("hi");
    return expect($('.doc h1').getText()).to.be.equal('GETTEXT');
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
