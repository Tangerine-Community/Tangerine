# -*- encoding: utf-8 -*-

Gem::Specification.new do |s|
  s.name = "premailer"
  s.version = "1.8.2"

  s.required_rubygems_version = Gem::Requirement.new(">= 0") if s.respond_to? :required_rubygems_version=
  s.authors = ["Alex Dunae"]
  s.date = "2014-03-14"
  s.description = "Improve the rendering of HTML emails by making CSS inline, converting links and warning about unsupported code."
  s.email = "code@dunae.ca"
  s.executables = ["premailer"]
  s.files = ["bin/premailer"]
  s.homepage = "http://premailer.dialect.ca/"
  s.require_paths = ["lib"]
  s.rubygems_version = "1.8.23"
  s.summary = "Preflight for HTML e-mail."

  if s.respond_to? :specification_version then
    s.specification_version = 4

    if Gem::Version.new(Gem::VERSION) >= Gem::Version.new('1.2.0') then
      s.add_runtime_dependency(%q<css_parser>, [">= 1.3.5"])
      s.add_runtime_dependency(%q<htmlentities>, [">= 4.0.0"])
      s.add_development_dependency(%q<bundler>, ["~> 1.3"])
      s.add_development_dependency(%q<rake>, ["!= 0.9.0", "~> 0.8"])
      s.add_development_dependency(%q<hpricot>, [">= 0.8.3"])
      s.add_development_dependency(%q<nokogiri>, [">= 1.4.4"])
      s.add_development_dependency(%q<yard>, ["~> 0.8.7"])
      s.add_development_dependency(%q<redcarpet>, ["~> 3.0"])
      s.add_development_dependency(%q<yard-redcarpet-ext>, ["~> 0.0.3"])
    else
      s.add_dependency(%q<css_parser>, [">= 1.3.5"])
      s.add_dependency(%q<htmlentities>, [">= 4.0.0"])
      s.add_dependency(%q<bundler>, ["~> 1.3"])
      s.add_dependency(%q<rake>, ["!= 0.9.0", "~> 0.8"])
      s.add_dependency(%q<hpricot>, [">= 0.8.3"])
      s.add_dependency(%q<nokogiri>, [">= 1.4.4"])
      s.add_dependency(%q<yard>, ["~> 0.8.7"])
      s.add_dependency(%q<redcarpet>, ["~> 3.0"])
      s.add_dependency(%q<yard-redcarpet-ext>, ["~> 0.0.3"])
    end
  else
    s.add_dependency(%q<css_parser>, [">= 1.3.5"])
    s.add_dependency(%q<htmlentities>, [">= 4.0.0"])
    s.add_dependency(%q<bundler>, ["~> 1.3"])
    s.add_dependency(%q<rake>, ["!= 0.9.0", "~> 0.8"])
    s.add_dependency(%q<hpricot>, [">= 0.8.3"])
    s.add_dependency(%q<nokogiri>, [">= 1.4.4"])
    s.add_dependency(%q<yard>, ["~> 0.8.7"])
    s.add_dependency(%q<redcarpet>, ["~> 3.0"])
    s.add_dependency(%q<yard-redcarpet-ext>, ["~> 0.0.3"])
  end
end
