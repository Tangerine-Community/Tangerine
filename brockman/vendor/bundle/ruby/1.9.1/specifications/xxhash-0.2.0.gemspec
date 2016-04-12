# -*- encoding: utf-8 -*-

Gem::Specification.new do |s|
  s.name = "xxhash"
  s.version = "0.2.0"

  s.required_rubygems_version = Gem::Requirement.new(">= 0") if s.respond_to? :required_rubygems_version=
  s.authors = ["Vasiliy Ermolovich"]
  s.date = "2013-09-04"
  s.description = "Ruby wrapper for xxHash lib"
  s.email = ["younash@gmail.com"]
  s.extensions = ["ext/xxhash/extconf.rb"]
  s.files = ["ext/xxhash/extconf.rb"]
  s.homepage = "http://github.com/nashby/xxhash"
  s.require_paths = ["lib"]
  s.rubygems_version = "1.8.23"
  s.summary = "Ruby wrapper for xxHash lib"

  if s.respond_to? :specification_version then
    s.specification_version = 3

    if Gem::Version.new(Gem::VERSION) >= Gem::Version.new('1.2.0') then
    else
    end
  else
  end
end
