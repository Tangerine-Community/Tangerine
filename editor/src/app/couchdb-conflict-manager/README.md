# \<couchdb-conflict-manager\>

[Demo Video](https://youtu.be/DvJ1gMdjOD4)

CouchDB Conflict Manager offers a workflow for resolving database conflicts that promotes traceability. Users can monitor the Active Conflicts list, and when a conflict is resolved, conflict revs are deleted from the source database but those conflict revs are also stashed in a separate database as an Archived Conflict and the action is logged in a separate log database. CouchDB Conflict Manager also offers a "Search Active Conflicts" feature that allows full text matching on revs in conflict. Heavy on memory but helpful for finding something that may seem to have gotten lost in a conflict rev.

## Install
To integrate into your web project, install via npm and then import from where it makes sense in your app. In an Angular App for example, adding the import statement to `polyfills.ts` could be a spot.

```
npm install --save git://github.com/rjsteinert/juicy-ace-editor.git#ES6-modules @polymer/paper-input @polymer/paper-button couchdb-conflict-manager
```

```
import '@polymer/paper-input/paper-textarea.js'
import '@polymer/paper-input/paper-input.js'
import '@polymer/paper-button'
import 'juicy-ace-editor/juicy-ace-editor-module.js'
import 'couchdb-conflict-manager/src/couchdb-conflict-manager.js'
```

## Usage
Declare the element in your app and feed it a URL of a database to manage conflicts on along with a username which is not necessarily the couchdb username to tie actions to in the logs.

```html
<style>
    /* Theme */
    * { 
        --mdc-theme-secondary: #333;
    }
</style>
<couchdb-conflict-manager dbUrl="https://user:pass@example.com:5984/some-database" username="rjcorwin"></couchdb-conflict-manager>
```

When the element has been configured to a database, the element will first prompt to install the dependencies on your server. This entails a few new databases and some views.

## Develop
0. Clone this repository.
1. Set up a CouchDB install with CORS enabled, create a user and a database. e.g. `docker run -p 5984:5984 --env "COUCHDB_USER=admin" --env "COUCHDB_PASSWORD=some-secure-password" couchdb`
2. In this repository, add `config.json` with URL containing credentials to the db and username `{ "dbUrl": "http://user:pass@localhost:5984/test", "username": "yourName" }`.
3. In this repo, install dependencies with `npm install`.
4. Run the dev server with `npm start` and open http://localhost:8080/. You will find the `<couchdb-conflict-manager>` element has been templated out for you with your dbUrl configuration from `config.json`. 

## Test
We're still finalizing the test harness on this project.
