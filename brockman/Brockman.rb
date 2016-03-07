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

puts Dir.pwd

require_relative 'utilities/output'
require_relative 'settings.rb'
require_relative 'routes/init'

$logger = Logger.new "Brockman.log"

class Brockman < Sinatra::Base

  helpers Sinatra::Cookies

  set :allow_origin      => :any,
      :allow_methods     => [:get, :post, :options],
      :allow_credentials => true,
      :max_age           => "1728000",
      :protection        => { :except => :json_csrf },
      :port              => 4446,
      :cookie_options    => {:domain => "tangerinecentral.org"},
      :env               => :production

  # pixel art proof of life
  get "/" do
    "
      <body><canvas id='big-img' width='200' height='200' style='width:404px;height:404px;margin:auto;top:0;left:0;right:0;bottom:0;position:absolute;'></canvas></body><script>var img;(img = new Image()).src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAKCAYAAABmBXS+AAAAg0lEQVQYV2NkQAMF+fn/QUITJk5khEnBGSABmAIQ+8nTpwxr1qwBy6MoCgkJ+S8jLQ1WcOfOHYYLFy5gKgLpAilEVoBh0v9+8f/T2esZTp8+zeD6byND1MJ3mCaBFIF0Lr/wG+xmrIpAEiCFIEUwBRjWgQSmTZv2H2Td/PnzsQcBRYoAFJJJC5nySD8AAAAASUVORK5CYII=';var big = document.getElementById('big-img').getContext('2d');big.imageSmoothingEnabled = false;big.drawImage(img,0,0,10,10,0,0,200,200);</script>
    "
  end

  run! if __FILE__ == $0

end




