
require 'selenium-webdriver'
require 'capybara'
require 'capybara/rspec'

require './config.rb'
require './helpers/helpers.rb'



=begin
#Capybara.register_driver :firefox do |app|
#  profile['browser.helperApps.neverAsk.saveToDisk'] = 'text/csv'
#  Capybara::Selenium::Driver.new(app, :browser => :firefox, :profile => profile)
#end

Capybara.register_driver :selenium do |app|
  Capybara::Selenium::Driver.new(app) # firefox
end


=end

Capybara.register_driver :selenium do |app|
  Capybara::Selenium::Driver.new(app, :browser => :chrome)
  #Capybara::Selenium::Driver.new(app) # firefox
end

Capybara.configure do |config|  
  config.run_server     = false
  config.default_driver = :selenium
  config.app_host       = 'http://databases.tangerinecentral.org/tangerine/_design/ojai/index.html'
end

Capybara.default_wait_time = 10

#require_relative 'features/sign_in.rb'
#require_relative 'features/groups.rb'
#require_relative 'features/assessments_screen.rb'
require_relative 'features/basic_assessment'
#require_relative 'features/csv'
#require_relative 'features/grids'
#require_relative 'features/surveys'
#require_relative 'features/assessment_duplication'
#require_relative './fixtures/grid.rb'
