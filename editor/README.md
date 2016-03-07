![Tangerine](http://www.tangerinecentral.org/sites/default/files/tangerine-logo-150.png)

# Assess students with tablets or your phone

Tangerine is an application for assessing students on any scale, country-level, district-level or classroom-level. Tangerine is designed for [Early Grade Reading Assessments](https://www.eddataglobal.org/reading/) but flexible and powerful enough to handle any survey's requirements.

Please visit the [wiki](https://github.com/Tangerine-Community/Tangerine/wiki) for the most up to date development guides and references and [Tangerine Central](http://www.tanerinecentral.org) for much more information and news.

Alternatively put, Tangerine is a [CouchApp](http://couchapp.org/page/index) that uses 
[Apache CouchDB](http://couchdb.apache.org/) built with [Backbone.js](http://backbonejs.org/), [LessCSS](http://lesscss.org/) written in [CoffeeScript](http://coffeescript.org/) augmented with [Sinatra](http://www.sinatrarb.com/) and PHP.

# Getting Started

_The following is a list of tools required to start developing for Tangerine. Related: See the guide for setting up a [Tangerine server](https://github.com/Tangerine-Community/Tangerine/wiki/Tangerine-Server)._

The overwhelming majority of our developers have prefered Mac or Linux. Windows alternatives are available but have not been thoroughly tested, and in some cases, not tested at all.

[Apache CouchDB](http://couchdb.apache.org/#download)

[CoffeeScript](http://coffeescript.org/#installation)

[CouchApp](https://github.com/benoitc/couchapp)

[Ruby](https://www.ruby-lang.org/en/downloads/)

[Listen](https://github.com/guard/listen)

[LessCSS](http://lesscss.org/#using-less-installation)

Then clone this repo.

    git clone https://github.com/Tangerine-Community/Tangerine.git

## Config

The folowing files may need to be configured to match our or your development environment.

  .couchapprc
  app/_docs/configuration

## Fire it up!

Quickly

  1. Start CouchDB
  2. `cd app`
  3. `couchapp push`
  4. goto `http://localhost:5984/tangerine/_design/ojai/index.html`

Normally

  1. Start CouchDB
  2. `cd app`
  3. `./listen.rb`
 
----

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program.  If not, see <http://www.gnu.org/licenses/>.