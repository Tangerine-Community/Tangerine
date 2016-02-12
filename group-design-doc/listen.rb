#! /usr/bin/ruby

require 'listen'

$jsDir = File.join Dir.pwd, "_attachments", "js"

class String
  # colorization
  def colorize(color_code)
    "\e[#{color_code}m#{self}\e[0m"
  end

  def red
    colorize(31)
  end

  def green
    colorize(32)
  end

  def yellow
    colorize(33)
  end

  def pink
    colorize(35)
  end
end

def push

  # Save current version number
  version = `git describe --tags`.gsub(/\n/,'')
  build   = `git rev-parse --short HEAD`.gsub(/\n/,'')
  
  File.open( File.join($jsDir, "version.js"), "w") {|f| f.write("window.Tangerine.buildVersion = \"#{build}\"\; window.Tangerine.version = \"#{version}\"\;") }

  Dir.chdir( $jsDir ) {
    `./uglify.rb dev`
    puts "\nGenerated:\t\tindex-dev.html"
    `./uglify.rb version.js`
    `./uglify.rb app`
    puts "\nCompiled\t\tapp.js\n\n"
  }
  `couchapp push`
end

def notify( type, message )
  printf "\a"
  unless `which osascript`.empty? # on a mac?
    message = /\.coffee:(.*?)$/.match(message)[1]
    notifier = "/Applications/terminal-notifier.app/Contents/MacOS/terminal-notifier" 
    `#{notifier} -message \"#{message}\" -title \"#{type}\"` 
  end
  `notify-send "#{type} - #{message}" -i /usr/share/icons/Humanity/status/128/dialog-warning.svg &` unless `which notify-send`.empty?
end

puts "\nGo ahead, programmer. I'm listening...\n\n"

listen = Listen.to(".") do |modified, added, removed|

  files = modified.concat(added).concat(removed)

  files.each { |file|
    # Handle coffeescript files
    /.*\.coffee$/.match(file) { |match|

      match = match.to_s

      if match.index "translation.coffee"
        # special case for i18n translation files. We just want a basic JSON object, nothing else.
        path = match.split("/")
        puts "\nCompiling translation file for language: #{path[-2]}"
        newFile = path[0..path.length-2].join("/")+"/translation.json"
        result = `coffee --compile --bare --print #{match}`
        bareJson = result.gsub(/[\;\(\)]|\/\/.*$\n/, '')
        File.open(newFile, "w") {|f| f.write(bareJson)}
        result = "" # to pass error checking
      else
        # Otherwise, just compile
        puts "\nCompiling:\t\t#{match}"
        couchSpecial = /shows\/|views\/|lists\//.match(match)
  
        result = `coffee --bare --compile #{match} 2>&1`
        if not couchSpecial
          jsFile = match.gsub(".coffee", ".js")
          Dir.chdir($jsDir) {
            puts `./uglify.rb #{jsFile}`
          }
        end

      end

      if result.index "error" 
        # Show errors
        notify("CoffeeScript Error", result.gsub(/.*error.*\/(.*\.coffee)/,"\\1"))
        puts "\nCoffeescript error\n******************\n#{result}".red()
      end

    } # END of coffeescripts

    # handle LESS -> CSS
    /.*\.less$/.match(file) { |match|
      puts "\nCompiling:\t\t#{match}"
      result = `lessc #{match} --yui-compress > #{match}.css`
      if result.index "Error"
        notify("LESS error",result)
        puts "\nLESS error\n******************\n#{result}".red()
      end
    } # END of LESS

    # Handle all the resulting compiled files
    /.*\.css|.*\.js$|.*\.html$|.*\.json$/.match(file) { |match|
      # Don't trigger push for these files
      unless /version\.js|app\.js|index-dev|\/min\//.match(file)
        puts "\nUpdating:\t\t#{match}"
        push()
      end
    } # END of compiled files

  } # END of each file

end

listen.start
sleep