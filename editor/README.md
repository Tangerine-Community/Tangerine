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

Add the following to your .bashrc or .zshrc:

export T_ADMIN=admin
export T_PASS=password
export T_COUCH_HOST=localhost
export T_COUCH_PORT=5984
export T_HOST_NAME=localhost
export T_TREE_URL=localhost
export T_PROTOCOL=http

The .couchapprc uses the first four variables. 

The folowing files need to be configured to match our or your development environment.

  app/_docs/configuration
  app/_docs/settings
  
Normally the values in those files are setup by the Dockerfile install process; however, if you are doing developement, 
it may be easier to run the following script and do development locally instead of in a docker container:

sed "s#INSERT_HOST_NAME#"$T_HOST_NAME"#g" _docs/configuration.template | sed "s#INSERT_TREE_URL#"$T_TREE_URL"#g" | sed "s#INSERT_PROTOCOL#"$T_PROTOCOL"#g" > _docs/configuration.json
sed "s#INSERT_HOST_NAME#"$T_HOST_NAME"#g" _docs/settings.template | sed "s#INSERT_PROTOCOL#"$T_PROTOCOL"#g" > _docs/settings.json 

You may need to tweak those settings: your Couchdb instance may not map to /db. 
If your db does not map to /db, also change the following lines in boot.coffee:

````

$.couch.urlPrefix = ''

Tangerine.db_name    = window.location.pathname.split("/")[1]
Backbone.couch_connector.config.base_url  = "#{urlParser.protocol}//#{urlParser.host}/"

````

Run the following commands to initialize the codebase:

````
npm install
npm start init
````
## Run

````
npm watch
````

## Debug

````
npm run debug
````

Then go to http://localhost:4444/app/group-foo/index-dev.html and you can do proper debugging.
 
----

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program.  If not, see <http://www.gnu.org/licenses/>.