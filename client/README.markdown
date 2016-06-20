# Tangerine

![Tangerine](http://www.tangerinecentral.org/sites/default/files/tangerine-logo-150.png)

[![Build Status](https://travis-ci.org/Tangerine-Community/Tangerine-client.svg)](https://travis-ci.org/Tangerine-Community/Tangerine-client)

[![Stories in Ready](https://badge.waffle.io/Tangerine-Community/Tangerine-client.png?label=ready&title=Ready)](https://waffle.io/Tangerine-Community/Tangerine-client)

## Assess students with tablets or your phone

Tangerine is an application for assessing students on any scale, country-level, district-level or classroom-level.
Tangerine is designed for [Early Grade Reading Assessments](https://www.eddataglobal.org/reading/) but flexible and powerful enough to handle any survey's requirements.

Please visit the [wiki](https://github.com/Tangerine-Community/Tangerine/wiki) for the most up to date development guides
and references and [Tangerine Central](http://www.tanerinecentral.org) for much more information and news.

Alternatively put, Tangerine is a [CouchApp](http://couchapp.org/page/index) that uses
[Apache CouchDB](http://couchdb.apache.org/) built with [Backbone.js](http://backbonejs.org/), [LessCSS](http://lesscss.org/) written in [CoffeeScript](http://coffeescript.org/) augmented with [Sinatra](http://www.sinatrarb.com/) and PHP.

## Following this project

The project website is at [tangerinecentral.org](http://tangerinecentral.org) and the software development roadmap is tracked 
in [Roadmap.md](https://github.com/Tangerine-Community/Tangerine-client/blob/master/Roadmap.md)

## Getting Started

_The following is a list of tools useful for Tangerine. Related: See the guide for setting up a
[Tangerine server](https://github.com/Tangerine-Community/Tangerine/wiki/Tangerine-Server).

[Node.js](https://nodejs.org/en/)

[Bower](http://bower.io)

Then clone this repo.

    git clone https://github.com/Tangerine-Community/Tangerine-client.git

Use the correct branch - for stable development, stick to master. For recent development, use develop

### Init the source code

    npm install
    bower install

These commands read the relevant node and ruby dependencies and installs all of the necessary libraries.

There's a postinstall script that runs when npm install is done that will add the android platform and then run gulp init.

### Start the app

To launch the app, run the npm start target, which uses the [http-server](https://www.npmjs.com/package/http-server)
and runs ./scripts/listen.rb to compile changed coffeescript files and other useful tasks.

    npm start

If you're doing application development, you'll want to run the debug gulp target

    npm run debug

When in debug, the app generates index-dev.html. View the app at http://localhost:8080/index-dev.html

### View the app

To view the app with minimised javascript, open http://localhost:8080

Sourcemaps are now available; therefore, you should be able to debug with them, although it is better to use the debug target (described above).

### Generate an APK
This requires [installing the Android SDK Tools](http://developer.android.com/sdk/installing/index.html?pkg=tools).

    npm build:apk

### Other useful targets

View package.json for other useful npm targets:

 - npm listen turns on the changes listener and compiles coffeescript files.
 - npm run build:apk will generate a debug APK.
 - npm test will run mocha-phantomjs tests and watch for changes to coffeescript files.
 - npm run testW will run tests using mocha-phantomjs, displaying output on command line and watch for changes to coffeescript files.
 - npm run testWatch will run mocha tests in the browser at http://localhost:9000/test/ and watch for changes to coffeescript files.
 - npm run debug will copy files into www/compiled and build index-dev.html. Use this when using chrome debugger until gulp
   handles sourcemaps better (https://github.com/terinjokes/gulp-uglify/issues/105). It's a little wonky; it may fail the first time it is run. Try again.
 - npm run debug-gulp index-dev will debug the index-dev gulp target in iron-node. Place the "debugger" keyword where you need the debugger to pause.
 - npm run debug-test will enable you to view the app and unit tests at the same time. Coffee source changes will get rendered to js. http://localhost:9000/test/

## Bootstrapping

Preload.js in the scripts dir will download assessments from an instance of Tangerine. Change the source group name in preload.js:

    var group_name = "groupName"; 
    
Enter the username and password on the commandline:

    node preload.js T_ADMIN=user T_PASS=pass

If you already have loaded data in your local pouch, you'll need to follow the instruction on clearing your pouch instance later in this document.
 
There is another way to pre-load data into your dev environment; however, it it more gered twoards writing tests:

`./scripts/compilepacks.js` will compile development Assessment packs used for testing to `./test/packs.json`.  

If you would like to use those Assessments in your sandbox, run the `./scripts/compilepacks.js`, copy `./test/packs.json` 
to `./src/packs.json` and then from your JS console run `Utils.loadDevelopmentPacks()`. 

## Resolving issues

Fork the repository and update your fork

    git remote show Tangerine-Community
    git checkout master
    git pull Tangerine-Community master

Get the id of the issue you’re fixing

    git checkout -b 189-footer-disappeared

Fix the bug and commit the change. Submit a pull request.

## Resolving merge conflicts

Sometimes you will get a conflict when attempting to merge your update with master. Here's a solution:

 - Update your fork's master

        git checkout master
        git pull Tangerine-Community master

 - Merge your code into master

        git merge name-of-your-bugfix-fork

 - Fix the errors.
 - Add them to git

        git add .

 - Commit       

## Clearing your pouch instance

Sometimes you need to start with a fresh pouch. Paste this to your javascript console and it will delete your tangerine pouch.

    var db = new PouchDB('tangerine');
      db.destroy().then(function () {
        // success
      }).catch(function (error) {
        console.log(error);
      });

## Run Tests

The tests run in mocha/phantomjs. The pouch runs in a in-memory container.

This requires that you have the Grunt CLI installed globally.

```
npm install -g grunt-cli
```

To run the tests, use the following command.

```
npm test
```

To run the tests in a browser, compile the src code, compile the test, start the test server, and then navigate to http://127.0.0.1:9000/test/index.html

```
npm start
# now kill the process using ctrl-c to be able to run the next command
npm test
# now kill the process using ctrl-c to be able to run the next command
npm run testInBrowser
```

## Write tests
Currently tests are all written using the [Mocha framework](https://mochajs.org/) and placed in `./test/spec/test.coffee`. We have a giant `describe` with each test contained in an `it`. For example, here is the test that verifies that an assessment can be retrieved.

```
it('Should return the expected assessment', (done)->
  id = "5edd67d0-9579-6c8d-5bb5-03a33b4556a6"
  assessment = new Assessment "_id" : id
  assessment.deepFetch({
    error:(err) ->
      console.log "Catch Error: " + JSON.stringify err
      done(err)
    success: (record) ->
      Tangerine.assessment = assessment
      expect(assessment.get("name")).to.equal('01. LTTP2 2015 - Student');
      done()
  })
)
```

When you write your own test, place it after the last `it` test. 

When you write a test, you might want to create a new Assessment to test against. In `./test/packs` folder you will find a number of JSON documents, one for each Assessment. Because these JSON docs are in that folder, they are automatically loaded into the PouchDB database before your test will run. You can include your own Assessment in that folder by creating it on an instance of Tangerine Server and then using the `./scripts/pack-cli.js` script to pull it down.

From the command line, the `./scripts/pack-cli.js` command can be used like this.
```
./scripts/pack-cli.js --id a8587919-0d0e-9155-b41d-7a71b41be749 --url http://username:password@databases.tangerinecentral.org/group-sweet_tree > test/packs/be749-grid-with-autostop-and-subsequent-test-with-link-to-grid.json
```

Notice the naming convention of the JSON file. It's the last 5 characters of the Assessment ID and then a descriptive human readable name.

## Dependencies

Using http://greenkeeper.io/ to manage dependencies.

## Tangerine API

Tangerine.progress is an object that contains status of the application: index, currentView, etc.

## i18n - Internationalisation

Add translations to the appropriate language file in src/locales/. To access translations in javascript:

    router.navigateAwayMessage = t("Router.message.quit_assessment")
    
Many Views place the translations into a property that can be used by a template. For example, in AssessmentCompositeView

     i18n: ->
        @text =
          "next" : t("SubtestRunView.button.next")
          "back" : t("SubtestRunView.button.back")
          
(snip)

    ui.text = @text
          
This can be referenced in a handlebars template:

    <button class='subtest-next navigation'>{{ui.text.next}}</button>

## Backward Compatibility

SurveyRunItemView contains some code to help Assessments created for earlier versions of Tangerine run in the new version.

    vm = {
      currentView: Tangerine.progress.currentSubview
    };
    
Also, some of the old displayCode is checked to see if it contains some of the old vm namespace:

      displaycodeFixed = displayCode.replace("vm.currentView.subtestViews[vm.currentView.index].prototypeView", "Tangerine.progress.currentSubview");
      
## Cordova Implementation notes

### Cordova version

The app current uses Cordova 6.

### Plugin Management

Use [cordova-check-plugins](https://github.com/dpa99c/cordova-check-plugins) to check/update plugins

#### Crosswalk

The Crosswalk plugin is used to provide a modern version of the Chromium browser for all Tangerine instances. This is configured in config.xml.

#### Whitelist issues

If you run into issue uploading data, be sure to check the Content-Security-Policy whitelist in index.html. It may be 
necessary to change or add a url.

        <meta http-equiv="Content-Security-Policy"
              content="default-src *;
                      style-src 'self' 'unsafe-inline';
                      script-src 'self' http://databases.tangerinecentral.org 'unsafe-inline' 'unsafe-eval' ;
                      img-src 'self' data:;
                      connect-src 'self' http://databases.tangerinecentral.org data: blob: filesystem:">

----

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program.  If not, see <http://www.gnu.org/licenses/>.
