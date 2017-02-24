# encoding: utf-8

###
#   ___                    _                           
#  | _ )  _ _   ___   __  | |__  _ ___   __ _   _ __   
#  | _ \ | '_| / _ \ / _| | / / | '   | / _` | | '  |  
#  |___/ |_|   \___/ \__| |_\_\ |_|_|_| \__,_| |_||_|  
#
# Reporting for Tangerine, I'm Brockman.
###

require "bundler"
Bundler.require

require_relative 'utilities/output'
require_relative 'config'
require_relative 'routes/init'

$logger = Logger.new "Brockman.log"

class Brockman < Sinatra::Base

  helpers Sinatra::Cookies

  set :allow_origin      => :any,
      :allow_methods     => [:get, :post, :options],
      :allow_credentials => true,
      :max_age           => "1728000",
      :protection        => { :except => :json_csrf },
      :port              => 3141,
      :cookie_options    => {:domain => "tangerinecentral.org"},
      :env               => :production

  get "/" do
    output "csv", false
  end

end



