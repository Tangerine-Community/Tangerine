# -*- encoding: utf-8 -*-

Gem::Specification.new do |s|
  s.name = "hpricot"
  s.version = "0.8.6"

  s.required_rubygems_version = Gem::Requirement.new(">= 0") if s.respond_to? :required_rubygems_version=
  s.authors = ["why the lucky stiff"]
  s.date = "2012-01-17"
  s.description = "a swift, liberal HTML parser with a fantastic library"
  s.email = "why@ruby-lang.org"
  s.extensions = ["ext/fast_xs/extconf.rb", "ext/hpricot_scan/extconf.rb"]
  s.extra_rdoc_files = ["README.md", "CHANGELOG", "COPYING"]
  s.files = ["README.md", "CHANGELOG", "COPYING", "ext/fast_xs/extconf.rb", "ext/hpricot_scan/extconf.rb"]
  s.homepage = "http://code.whytheluckystiff.net/hpricot/"
  s.rdoc_options = ["--quiet", "--title", "The Hpricot Reference", "--main", "README.md", "--inline-source"]
  s.require_paths = ["lib"]
  s.rubyforge_project = "hobix"
  s.rubygems_version = "1.8.23"
  s.summary = "a swift, liberal HTML parser with a fantastic library"

  if s.respond_to? :specification_version then
    s.specification_version = 3

    if Gem::Version.new(Gem::VERSION) >= Gem::Version.new('1.2.0') then
    else
    end
  else
  end
end
