# -*- encoding: utf-8 -*-

Gem::Specification.new do |s|
  s.name = "sinatra-cross_origin"
  s.version = "0.3.2"

  s.required_rubygems_version = Gem::Requirement.new(">= 0") if s.respond_to? :required_rubygems_version=
  s.authors = ["Brit Gardner"]
  s.date = "2013-12-31"
  s.description = "Cross Origin Resource Sharing helper for Sinatra"
  s.email = "brit@britg.com"
  s.extra_rdoc_files = ["LICENSE", "README.markdown"]
  s.files = ["LICENSE", "README.markdown"]
  s.homepage = "http://github.com/britg/sinatra-cross_origin"
  s.require_paths = ["lib"]
  s.rubygems_version = "1.8.23"
  s.summary = "Cross Origin Resource Sharing helper for Sinatra"

  if s.respond_to? :specification_version then
    s.specification_version = 3

    if Gem::Version.new(Gem::VERSION) >= Gem::Version.new('1.2.0') then
    else
    end
  else
  end
end
