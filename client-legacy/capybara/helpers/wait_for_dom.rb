def wait_for_dom(timeout = Capybara.default_wait_time)
  uuid = SecureRandom.uuid
  page.find("body")
  page.evaluate_script <<-EOS
    _.defer(function() {
      $('body').append("<div id='#{uuid}'></div>");
    });
  EOS
  page.find("##{uuid}")
end