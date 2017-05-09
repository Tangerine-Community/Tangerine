![Tangerine](http://www.tangerinecentral.org/sites/default/files/tangerine-logo-150.png)

# Assess students with tablets or your phone

Tangerine is an application for assessing students on any scale, country-level, district-level or classroom-level.
Tangerine is designed for [Early Grade Reading Assessments](https://www.eddataglobal.org/reading/) but flexible and powerful enough to handle any survey's requirements.

Please visit the [wiki](https://github.com/Tangerine-Community/Tangerine/wiki) for the most up to date development guides
and references and [Tangerine Central](http://www.tangerinecentral.org) for much more information and news.

Alternatively put, Tangerine is a [CouchApp](http://couchapp.org/page/index) that uses
[Apache CouchDB](http://couchdb.apache.org/) built with [Backbone.js](http://backbonejs.org/), [LessCSS](http://lesscss.org/) written in [CoffeeScript](http://coffeescript.org/) augmented with [Sinatra](http://www.sinatrarb.com/) and PHP.

# Getting Started

_The following is a list of tools required to start developing for Tangerine. Related: See the guide for setting up a
[Tangerine server](https://github.com/Tangerine-Community/Tangerine/wiki/Tangerine-Server)._

The overwhelming majority of our developers have prefered Mac or Linux. Windows alternatives are available but have not
been thoroughly tested, and in some cases, not tested at all.

[Apache CouchDB](http://couchdb.apache.org/#download)

[CoffeeScript](http://coffeescript.org/#installation)

[Ruby](https://www.ruby-lang.org/en/downloads/)

[LessCSS](http://lesscss.org/#using-less-installation)

[Node.js](https://nodejs.org/en/)

Then clone this repo.

    git clone https://github.com/Tangerine-Community/Tangerine-client.git

## Init the source code

    npm install
    bundle install

These two commands read the relevant node and ruby dependencies and installs all of the necessary libraries.

There's a postinstall script that runs when npm install is done that will add the android platform and then run init.rb,
which sets up all the js.

## Start the app

To launch the app, run the npm start target, which uses the [http-server](https://www.npmjs.com/package/http-server)
and runs ./scripts/listen.rb to compile changed coffeescript files and other useful tasks.

    npm start

## Generate an APK

    npm build:apk

## Other useful targets

View package.json for other useful npm targets:

 - npm listen turns on the changes listener and compiles coffeescript files.
 - npm build:apk will generate a debug APK.

----

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program.  If not, see <http://www.gnu.org/licenses/>.
