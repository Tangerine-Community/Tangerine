# -*- encoding: utf-8 -*-

Gem::Specification.new do |s|
  s.name = "sinatra-contrib"
  s.version = "1.4.2"

  s.required_rubygems_version = Gem::Requirement.new(">= 0") if s.respond_to? :required_rubygems_version=
  s.authors = ["Konstantin Haase", "Gabriel Andretta", "Trevor Bramble", "Zachary Scott", "Katrina Owen", "Nicolas Sanguinetti", "Hrvoje \u{160}imi\u{107}", "Masahiro Fujiwara", "Rafael Magana", "Jack Chu", "Ilya Shindyapin", "Kashyap", "Sumeet Singh", "lest", "Adrian Paca\u{142}a", "Aish", "Andrew Crump", "David Asabina", "Eliot Shepard", "Eric Marden", "Gray Manley", "Guillaume Bouteille", "Jamie Hodge", "Kyle Lacy", "Martin Frost", "Mathieu Allaire", "Matt Lyon", "Matthew Conway", "Meck", "Michi Huber", "Patricio Mac Adden", "Reed Lipman", "Samy Dindane", "Thibaut Sacreste", "Uchio KONDO", "Will Bailey", "undr"]
  s.date = "2013-12-01"
  s.description = "Collection of useful Sinatra extensions"
  s.email = ["konstantin.mailinglists@googlemail.com", "ohhgabriel@gmail.com", "inbox@trevorbramble.com", "zachary@zacharyscott.net", "katrina.owen@gmail.com", "contacto@nicolassanguinetti.info", "shime.ferovac@gmail.com", "m-fujiwara@axsh.net", "raf.magana@gmail.com", "jack@jackchu.com", "konstantin.haase@gmail.com", "ilya@shindyapin.com", "kashyap.kmbc@gmail.com", "ortuna@gmail.com", "e@zzak.io", "just.lest@gmail.com", "altpacala@gmail.com", "aisha.fenton@visfleet.com", "andrew.crump@ieee.org", "david@supr.nu", "eshepard@slower.net", "eric.marden@gmail.com", "g.manley@tukaiz.com", "duffman@via.ecp.fr", "jamiehodge@me.com", "kylewlacy@me.com", "blame@kth.se", "mathieuallaire@gmail.com", "matt@flowerpowered.com", "himself@mattonrails.com", "yesmeck@gmail.com", "michi.huber@gmail.com", "patriciomacadden@gmail.com", "rmlipman@gmail.com", "samy@dindane.com", "thibaut.sacreste@gmail.com", "udzura@udzura.jp", "will.bailey@gmail.com", "undr@yandex.ru"]
  s.homepage = "http://github.com/sinatra/sinatra-contrib"
  s.require_paths = ["lib"]
  s.rubygems_version = "1.8.23"
  s.summary = "Collection of useful Sinatra extensions"

  if s.respond_to? :specification_version then
    s.specification_version = 4

    if Gem::Version.new(Gem::VERSION) >= Gem::Version.new('1.2.0') then
      s.add_runtime_dependency(%q<sinatra>, ["~> 1.4.0"])
      s.add_runtime_dependency(%q<backports>, [">= 2.0"])
      s.add_runtime_dependency(%q<tilt>, ["~> 1.3"])
      s.add_runtime_dependency(%q<rack-test>, [">= 0"])
      s.add_runtime_dependency(%q<rack-protection>, [">= 0"])
      s.add_runtime_dependency(%q<multi_json>, [">= 0"])
      s.add_development_dependency(%q<rspec>, ["~> 2.3"])
      s.add_development_dependency(%q<haml>, [">= 0"])
      s.add_development_dependency(%q<erubis>, [">= 0"])
      s.add_development_dependency(%q<slim>, [">= 0"])
      s.add_development_dependency(%q<rake>, [">= 0"])
    else
      s.add_dependency(%q<sinatra>, ["~> 1.4.0"])
      s.add_dependency(%q<backports>, [">= 2.0"])
      s.add_dependency(%q<tilt>, ["~> 1.3"])
      s.add_dependency(%q<rack-test>, [">= 0"])
      s.add_dependency(%q<rack-protection>, [">= 0"])
      s.add_dependency(%q<multi_json>, [">= 0"])
      s.add_dependency(%q<rspec>, ["~> 2.3"])
      s.add_dependency(%q<haml>, [">= 0"])
      s.add_dependency(%q<erubis>, [">= 0"])
      s.add_dependency(%q<slim>, [">= 0"])
      s.add_dependency(%q<rake>, [">= 0"])
    end
  else
    s.add_dependency(%q<sinatra>, ["~> 1.4.0"])
    s.add_dependency(%q<backports>, [">= 2.0"])
    s.add_dependency(%q<tilt>, ["~> 1.3"])
    s.add_dependency(%q<rack-test>, [">= 0"])
    s.add_dependency(%q<rack-protection>, [">= 0"])
    s.add_dependency(%q<multi_json>, [">= 0"])
    s.add_dependency(%q<rspec>, ["~> 2.3"])
    s.add_dependency(%q<haml>, [">= 0"])
    s.add_dependency(%q<erubis>, [">= 0"])
    s.add_dependency(%q<slim>, [">= 0"])
    s.add_dependency(%q<rake>, [">= 0"])
  end
end
