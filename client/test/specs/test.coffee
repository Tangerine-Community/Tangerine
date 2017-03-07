assert = require('assert');
expect = require('chai').expect;

describe('webdriver.io Tangerine index page test', () ->
  it('should be able to filter for commands',  () ->
    browser.url('http://localhost:8080/#class');
    #    // filtering property commands
#    $('.searchbar input').setValue('getT');
    #    // get all results that are displayed
#    results = $$('.icon klass_run').filter( (link) ->
#      return link.isVisible();
#    )
    #// assert number of results
#    expect(results.length).to.be.equal(3);
    #// check out second result
    myElem = browser.element('.klass_run');
    myElem.waitForVisible();
    browser.click('.klass_run');
    expect($('.KlassPartlyView h1').getText()).to.be.equal('assessment status');
  );
);

describe('webdriver.io page', () ->
  it('should have the right title - the fancy generator way',  () ->
    browser.url('http://webdriver.io');
    title = browser.getTitle();
    assert.equal(title, 'WebdriverIO - Selenium 2.0 javascript bindings for nodejs');
  )
);


